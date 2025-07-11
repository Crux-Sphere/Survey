const JWT = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const crypto = require("crypto");

const generateResetToken = (id, email, expiresIn = "10m") => {
  return JWT.sign({ id, email }, process.env.JWT_SECRET, { expiresIn });
};

const generateCryptoOTP = () => {
  try {
    // Generate a crypto-secure random number
    const buffer = crypto.randomBytes(3); // 3 bytes = 6 digits (base 10)
    const number = buffer.readUIntBE(0, 3);

    // Ensure 6 digits by taking modulo and adding offset if needed
    const otp = ((number % 900000) + 100000).toString();

    return otp;
  } catch (error) {
    console.error("Error generating crypto OTP:", error);
    throw new Error("Failed to generate crypto-secure OTP");
  }
};

const generateOTPWithExpiry = (expiryMinutes = 10) => {
  try {
    const otp = generateCryptoOTP();
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000); // Current time + minutes in milliseconds

    return {
      otp,
      expiryTime,
      isExpired: () => Date.now() > expiryTime,
    };
  } catch (error) {
    console.error("Error generating OTP with expiry:", error);
    throw new Error("Failed to generate OTP with expiry");
  }
};

const downloadExcel = async (data, res, req) => {
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Survey Responses");

  let fileName = "Responses";
  const baseHeaders = [
    { header: "S_no", key: "serial_no", width: 8 },
    { header: "Panna Pramukh", key: "panna_pramukh", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
    { header: "Response Date", key: "response_date", width: 30 },
    { header: "User", key: "user", width: 20 },
    { header: "House number", key: "house_no", width: 20 },
    { header: "AC number", key: "ac_no", width: 20 },
    { header: "Name", key: "name", width: 20 },
    { header: "Phone number", key: "phone_no", width: 20 },
    { header: "Booth number", key: "booth_no", width: 20 },
    { header: "Latitude", key: "latitude", width: 20 },
    { header: "Longitude", key: "longitude", width: 20 },
    { header: "Location link", key: "location_link", width: 20 },
    { header: "Audio", key: "audio", width: 20 },
  ];

  const protocol = req.protocol || (req.secure ? "https" : "http");
  const host = req.get ? req.get("host") : req.headers?.host;

  if (data.length > 0) {
    fileName = data[0].survey_id?.name?.split(" ").join("_") || "Responses";
  }

  // --- Build question map ---
  const questionMap = new Map(); // question => { type, subQuestions }
  data.forEach((item) => {
    item.responses.forEach((resp) => {
      if (!questionMap.has(resp.question)) {
        if (resp.question_type === "Radio Grid") {
          const subQs = resp.response
            .split("\n")
            .map((line) => line.split(":")[0]?.trim())
            .filter(Boolean);
          questionMap.set(resp.question, {
            type: "Radio Grid",
            subQuestions: [...new Set(subQs)],
          });
        } else {
          questionMap.set(resp.question, {
            type: resp.question_type,
            subQuestions: [],
          });
        }
      }
    });
  });

  // --- Prepare Headers ---
  const headerRow1 = baseHeaders.map((h) => h.header);
  const headerRow2 = baseHeaders.map(() => "");
  const dynamicKeys = [];

  const radioGridCols = new Map(); // key => color
  const questionKeyToLabelMap = new Map(); // cleanKey => { main, sub }
  const radioGridColors = [
    "FFF9DA",
    "DAF7FF",
    "E6DAFF",
    "DAFFE4",
    "FFDADA",
    "FFECD5",
    "E0F7FA",
  ];

  let colorIndex = 0;
  let qIndex = 0;

  for (const [question, info] of questionMap.entries()) {
    if (info.type === "Radio Grid") {
      const color = radioGridColors[colorIndex % radioGridColors.length];
      colorIndex++;

      headerRow1.push(question);
      for (let i = 1; i < info.subQuestions.length; i++) headerRow1.push("");

      info.subQuestions.forEach((sub) => {
        const cleanKey = `q${qIndex}_${sub.replace(/\s+/g, "_")}`;
        headerRow2.push(sub);
        dynamicKeys.push(cleanKey);
        radioGridCols.set(cleanKey, color);
        questionKeyToLabelMap.set(cleanKey, { main: question, sub });
      });

      qIndex++;
    } else {
      headerRow1.push(question);
      headerRow2.push("");
      dynamicKeys.push(question);
    }
  }

  // --- Define worksheet columns ---
  worksheet.columns = [
    ...baseHeaders,
    ...dynamicKeys.map((k) => ({ header: k, key: k, width: 30 })),
  ];

  // --- Add header row 2 only ---
  worksheet.addRow(headerRow2);

  worksheet.getRow(1).height = 30; // headerRow1
  worksheet.getRow(2).height = 40; // headerRow2

  // --- Merge and manually assign header row 1 text ---
  let colIdx = baseHeaders.length + 1;
  for (const [question, info] of questionMap.entries()) {
    const span = info.type === "Radio Grid" ? info.subQuestions.length : 1;
    if (span > 1) {
      worksheet.mergeCells(1, colIdx, 1, colIdx + span - 1);
    } else {
      worksheet.mergeCells(1, colIdx, 2, colIdx);
    }
    worksheet.getCell(1, colIdx).value = question;
    colIdx += span;
  }

  // --- Style header rows ---
  [1, 2].forEach((rowNum) => {
    const row = worksheet.getRow(rowNum);
    row.eachCell((cell, colNumber) => {
      const colKey = worksheet.columns[colNumber - 1]?.key;
      const bgColor = radioGridCols.get(colKey);

      cell.font = { bold: true };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      // Apply background color if needed
      if (bgColor) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
      }

      // Always apply border
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // --- Add data rows ---
  data.forEach((item, index) => {
    const baseRow = {
      serial_no: index + 1,
      panna_pramukh: item.panna_pramukh_assigned?.name || "N/A",
      status: item.contacted ? "Contacted" : "Not Contacted",
      remark: item.remark || "No Remark",
      response_date: item.updatedAt || item.createdAt || "N/A",
      user: item.user_id?.name || "Unknown",
      house_no: item.house_no || "N/A",
      ac_no: item.ac_no || "N/A",
      name: item.name || "N/A",
      phone_no: item.phone_no || "N/A",
      booth_no: item.booth_no || "N/A",
      latitude: item.location_data?.latitude || "N/A",
      longitude: item.location_data?.longitude || "N/A",
      location_link: item.location_data
        ? {
            text: "View Location",
            hyperlink: `${protocol}://maps.google.com/maps?q=${item.location_data.latitude},${item.location_data.longitude}`,
          }
        : "N/A",
      audio: item.audio_recording_path
        ? {
            text: "Audio File",
            hyperlink: `${process.env.BUCKET_URL}/${item.audio_recording_path}`,
          }
        : "N/A",
    };

    const responseData = {};

    item.responses.forEach((resp) => {
      if (resp.question_type === "Radio Grid") {
        const lines = resp.response.split("\n");
        lines.forEach((line) => {
          const [sub, val] = line.split(":").map((s) => s.trim());
          if (sub) {
            const key = [...questionKeyToLabelMap.entries()].find(
              ([k, v]) => v.main === resp.question && v.sub === sub
            )?.[0];
            if (key) responseData[key] = val || "No Response";
          }
        });
      } else {
        responseData[resp.question] = resp.response || "No Response";
      }
    });

    worksheet.addRow({ ...baseRow, ...responseData });
  });

  // --- Finalize and download ---
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
};

const downloadDailyWorkExcel = async (data, res, req) => {
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Daily Work Report");

  const allQuestions = new Set();
  data.forEach(user => {
    (user.responses || []).forEach(respObj => {
      const resp = respObj.response || {};
      (resp.responses || []).forEach(ans => {
        allQuestions.add(ans.question);
      });
    });
  });
  const questionList = Array.from(allQuestions);

  const headers = [
    { header: "S.No", key: "serial_no", width: 8 },
    { header: "User Name", key: "userName", width: 25 },
    { header: "Email", key: "userEmail", width: 30 },
    { header: "Total Responses", key: "totalResponses", width: 15 },
    { header: "Work Duration (h:m)", key: "workDuration", width: 18 },
    { header: "Start Date", key: "firstWorkTime", width: 22 },
    { header: "End Date", key: "lastWorkTime", width: 22 },
    { header: "AC No", key: "ac_no", width: 12 },
    { header: "Booth No", key: "booth_no", width: 12 },
    { header: "Created At", key: "createdAt", width: 22 },
    ...questionList.map(q => ({ header: q, key: q, width:  Math.min(80, Math.max(30, Math.ceil(q.length / 2))) }))
  ];
  worksheet.columns = headers;

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
  });

  let serial = 1;
  data.forEach(user => {
    const durationH = Math.floor((user.workDurationMinutes || 0) / 60);
    const durationM = (user.workDurationMinutes || 0) % 60;
    // console.log('Excel Export:', user.userName, 'totalResponses:', user.totalResponses, 'responses.length:', (user.responses || []).length);
    (user.responses || []).forEach((respObj, idx) => {
      const resp = respObj.response || {};
      console.log('  Response', idx + 1, resp._id || resp.createdAt);
      const row = {
        serial_no: serial++,
        userName: user.userName || "N/A",
        userEmail: user.userEmail || "N/A",
        totalResponses: user.totalResponses || 0,
        workDuration: `${durationH}h ${durationM}m`,
        firstWorkTime: user.firstWorkTime ? new Date(user.firstWorkTime).toLocaleDateString("en-IN") : "N/A",
        lastWorkTime: user.lastWorkTime ? new Date(user.lastWorkTime).toLocaleDateString("en-IN") : "N/A",
        ac_no: resp.ac_no || "",
        booth_no: resp.booth_no || "",
        createdAt: resp.createdAt ? new Date(resp.createdAt).toLocaleString("en-IN") : "",
      };
      (resp.responses || []).forEach(ans => {
        row[ans.question] = ans.response || "";
      });
      worksheet.addRow(row);
    });
  });

  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const fileName = `Daily_Work_Report_${today}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  await workbook.xlsx.write(res);
  res.end();
};

function generateUniqueSurveyId() {
  const prefix = "survey-";
  
  // Base36 timestamp (short and always increasing)
  const timestamp = Date.now().toString(36).toUpperCase(); // e.g., "L9K9GP"

  // Random 2 letters
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = Array.from({ length: 2 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length))
  ).join("");

  return `${prefix}${randomLetters}${timestamp}`;
}


module.exports = {
  generateResetToken,
  downloadExcel,
  downloadDailyWorkExcel,
  generateOTPWithExpiry,
  generateUniqueSurveyId
};



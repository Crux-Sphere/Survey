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

const downloadExcel = async (data, res,req) => {
  console.log("data is --->", data);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("MyData");

  // Define base columns
  let fileName = "Response";
  const cols = [
    { header: "S_no", key: "serial_no", width: 8 },
    { header: "Panna Pramukh", key: "panna_pramukh", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Remark", key: "remark", width: 30 },
    { header: "Response Date", key: "response_date", width: 30 },
    { header: "User", key: "user", width: 20 },
    { header: "House number", key: "house_no", width: 20 },
    { header: "AC number", key: "ac_no", width: 20 },
    { header: "Booth number", key: "booth_no", width: 20 },
    { header: "Latitude", key: "latitude", width: 20 },
    { header: "Longitude", key: "longitude", width: 20 },
    { header: "Location link", key: "location_link", width: 20 },
    { header: "Audio", key: "audio", width: 20 },
  ];

  // Add dynamic response columns based on the first document
  if (data.length > 0) {
    console.log(data[0].survey_id.name);
    fileName = data[0].survey_id.name.split(" ").join("_");
    data[0].responses.forEach((response) => {
      cols.push({
        header: response.question, // Column header from the question
        key: response.question, // Use the question as the key
        width: 30,
      });
    });
  }

  // Assign columns to the worksheet
  worksheet.columns = cols;

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true }; // Apply bold style to each header cell
  });

  // Add rows dynamically
  data.forEach((item, index) => {
    // Get protocol and host dynamically from the request object
    const protocol = req.protocol || (req.secure ? "https" : "http");
    const host = req.get ? req.get("host") : (req.headers && req.headers.host);

    const row = {
      serial_no: index + 1,
      panna_pramukh: item.panna_pramukh_assigned
      ? item.panna_pramukh_assigned.name
      : "N/A",
      status: item.contacted ? "Contacted" : "Not Contacted",
      remark: item.remark || "No Remark",
      response_date: item.updatedAt || item.createdAt || "N/A",
      user: item.user_id?.name || "Unknown",
      house_no: item.house_no || "N/A",
      ac_no: item.ac_no || "N/A",
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
        hyperlink: `${protocol}://${host}/${item.audio_recording_path}`,
        }
      : "N/A",
    };

    // Populate response answers in the corresponding columns
    item.responses.forEach((response) => {
      row[response.question] = response.response || "No Response";
    });

    worksheet.addRow(row);
  });

  // Set response headers for file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);

  // Stream the workbook to the response
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  generateResetToken,
  downloadExcel,
  generateOTPWithExpiry,
};

// export const SERVER_URI = "http://localhost:6969";
export const SERVER_URI = "http://180.151.233.107:6969";
// export const SERVER_URI = "https://survey-3uf0.onrender.com";

// users
export const get_user = "api/user/getUser";
export const get_all_users = "api/user/getAllUsers";
export const add_users = "api/user/addUsers";
export const add_multiple_users = "api/user/addMultipleUsers";
export const update_user = "api/user/updateUser";
export const update_users = "api/user/updateUsers";
export const get_all_chats_data = "api/chatroom/getAllChatsData";
export const get_supervisor_collectors = "api/user/getSupervisorCollectors"
export const assign_booth = "api/user/assignBooth"

// karyakartas
export const get_all_karyakartas = "api/user/getAllKaryakarta"
export const get_karyakarta = "api/user/getKaryakarta"
export const create_karyakarta = "api/user/createKaryakarta"
export const update_karyakarta = "api/user/updateKaryakarta"
export const get_panna_pramukh = "api/user/getPannaPramukh"
export const get_panna_pramukh_ac_list = "api/user/getUsersByAcList"
export const get_booth_adhyaksh = "api/user/getBoothAdhyaksh"
export const updateMultipleKaryakarta = "api/user/updateMultipleKaryakarta"
export const import_karyakartas = "api/user/importKaryakartas"


// surveys
export const create_survey = "api/survey/saveSurvey";
export const update_survey = "api/survey/updateSurvey";
export const get_survey = "api/survey/getSurvey";
export const delete_survey = "api/survey/deleteSurvey";
export const get_all_surveys = "api/survey/getAllSurveys";
export const get_survey_by_booth_ac= "api/survey/getSurveysByAcAndBooth";


//responses
export const save_responses = "api/response/saveResponses"
export const get_all_survey_responses = "api/response/getAllSurveyResponses"
export const get_survey_responses = "api/response/getAllResponses"
export const get_survey_responses_stats = "api/response/getSurveyResponseStats"
export const get_survey_responses_by_family = "api/response/getGroupedByFamily"
export const update_response = "api/response/updateResponse"
export const save_quality_remark = "api/response/saveQualityRemark"


// questions
export const ignore_nesting_forms = ["Contact Form", "Address"];

// dashboard
export const dashboard = "api/dashboard"

//auth
export const login = "api/auth/login";
export const signup = "api/auth/signup";
export const forgot_password = "api/auth/forgotPassword";
export const reset_password = "api/auth/resetPassword";
export const admin_login  = "api/auth/adminLogin";

// roles
export const get_all_roles = "api/role/allRoles"
export const get_roles = "api/role/roles"
export const create_role = "api/role/create"
export const update_role = "api/role/update"
export const delete_role = "api/role/delete"

// todos
export const create_todo = "api/todo/create"
export const get_todo = "api/todo/todo"
export const get_all_todos = "api/todo/todos"
export const update_todo = "api/todo/update"
export const delete_todo = "api/todo/delete"

// sampling

export const create_sampling = "api/sampling/assign-sample-responses"
export const get_sampling = "api/sampling/sample-responses"
export const get_sample_surveys = "api/sampling/sample-surveys"
export const get_sample_groups = "api/sampling/groups"
export const delete_sampling = "api/sampling/delete"

// vrm team manager
export const get_vrm_dashboard = "api/call-rating/dashboard"
export const call_ratings = "api/call-rating/call-ratings"


// variables
export const supervisorId = "675985aaa6b36c1fa78d5517"
export const surveyCollectorId = "671f997d38863c2bfc859e76"
export const surveyManagerId = "671f999c38863c2bfc859e7a"
export const qualityCheckId = "675a92c24bbe3577d16bcb64"
export const districtPresidentId = "67713c803e1c10c39195a9cc"
export const shaktiKendraId = "67713c9a3e1c10c39195a9ce"
export const boothAdhyakshId = "671f99d938863c2bfc859e7f"
export const VREId = "6793cb217ad0c3539d615831"
export const validRoles = [
  'Supervisor',
  'Panna Pramukh',
  'Survey Manager',
  'Quality Check',
  'Data Analyst',
  'Data Manager',
  'Support Executive',
  'VRM Team Manager'
]
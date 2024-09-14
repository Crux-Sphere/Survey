export const SERVER_URI = "http://localhost:6969";
// export const SERVER_URI = "https://survey-3uf0.onrender.com";

// users
export const get_user = "api/user/getUser";
export const get_all_users = "api/user/getAllUsers";
export const add_users = "api/user/addUsers";
export const update_user = "api/user/updateUser";

// surveys
export const create_survey = "api/survey/saveSurvey";
export const update_survey = "api/survey/updateSurvey";
export const get_survey = "api/survey/getSurvey";
export const delete_survey = "api/survey/deleteSurvey";
export const get_all_surveys = "api/survey/getAllSurveys";

// questions
export const ignore_nesting_forms = ["Contact Form", "Address"];

//auth
export const login = "api/auth/login";
export const signup = "api/auth/signup";
export const forgot_password = "api/auth/forgotPassword";
export const reset_password = "api/auth/resetPassword";

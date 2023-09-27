import axios from "axios";

/**
 * 获取用户信息
 * @param {String} userName
 * @returns {Promise<object>} 用户信息
 */
export const getUserInfo = (userName) => {
  const apiPath = "https://api.github.com/users";
  return axios.get(`${apiPath}/${userName}`);
};

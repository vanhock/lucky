export default {
  serverUrl: "",
  apiUrl: process.env.VUE_APP_API_URL,
  proxyUrl: process.env.VUE_APP_PROXY_URL,
  projectsFolderUrl: `${process.env.VUE_APP_PROXY_URL}/projects`,
  authUrl: "/sign-in?redirect=disabled",
  extensionId: "pniajcifdcfkbcigpipdidnhhjbliglh",
  iconSizes: [16, 19, 38, 48, 128]
};

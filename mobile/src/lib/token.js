// Persistent login: the JWT is stored securely on the device (Keychain / Keystore)
// so parents/students don't re-enter credentials each time — the key ask from BVK.
import * as SecureStore from "expo-secure-store";

const KEY = "vb_token";
const ROLE_KEY = "vb_role";

export async function saveToken(token) {
  await SecureStore.setItemAsync(KEY, token);
}
export async function getToken() {
  return SecureStore.getItemAsync(KEY);
}
export async function saveRole(role) {
  if (role) await SecureStore.setItemAsync(ROLE_KEY, role);
}
export async function getRole() {
  return SecureStore.getItemAsync(ROLE_KEY);
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(KEY);
  await SecureStore.deleteItemAsync(ROLE_KEY);
}

// role -> navigator screen name. Only Vidyarthi has a dedicated screen so far;
// other roles fall back to the generic Home until their screens are built.
export const ROLE_SCREEN = {
  Vidyarthi: "Vidyarthi",
  Acharya: "Home",
  Palaka: "Home",
  "Pradhana Acharya": "Home",
  Nyasa: "Home",
  "School Admin": "Home",
};
export const screenForRole = (role) => ROLE_SCREEN[role] || "Home";

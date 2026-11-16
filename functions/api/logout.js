import { clearCookie, json } from "../_lib/auth.js";

export const onRequestPost = () => json({}, 200, { "Set-Cookie": clearCookie() });

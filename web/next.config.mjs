/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compile the shared TS package from the monorepo (API client, auth, types).
  transpilePackages: ["@vb/shared"],
};
export default nextConfig;

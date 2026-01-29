// instrumentation.ts



export function register() {
  console.log("--- NEXT.JS RUNTIME STARTING ---");
  console.log("PORT:", process.env.PORT);
  console.log("APP_HOST:", process.env.APP_HOST);
  console.log("APP_URL:", process.env.APP_URL);
  console.log("--------------------------------");
  console.log("--- 环境变量 ---");
  console.log("NEXT_PUBLIC_GITHUB_OWNER:", process.env.NEXT_PUBLIC_GITHUB_OWNER);
  console.log("NEXT_PUBLIC_GITHUB_REPO:", process.env.NEXT_PUBLIC_GITHUB_REPO);
  console.log("NEXT_PUBLIC_GITHUB_BRANCH:", process.env.NEXT_PUBLIC_GITHUB_BRANCH);
  console.log("--------------------------------");


}

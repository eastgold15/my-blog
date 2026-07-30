/**
 * Header 服务端包装器
 * 在服务端获取导航数据并传递给客户端 Header 组件
 */

import { Header } from "@/components/layout/header";
import { getNavigation } from "@/lib/navigation";

export async function HeaderWrapper() {
  const navItems = await getNavigation();

  return <Header navItems={navItems} />;
}

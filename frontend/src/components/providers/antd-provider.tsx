"import client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App as AntdApp, type ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#4f46e5", // indigo-600
    borderRadius: 8,
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
};

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}

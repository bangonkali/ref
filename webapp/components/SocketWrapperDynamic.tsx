import dynamic from "next/dynamic";

const SocketWrapperDynamic = dynamic(
  () => import("../components/SocketWrapper"),
  { ssr: false }
);

export default SocketWrapperDynamic;

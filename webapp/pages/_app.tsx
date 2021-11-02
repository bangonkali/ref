import "../styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { RecoilRoot } from "recoil";
import SocketWrapperDynamic from "../components/SocketWrapperDynamic";
// import SocketWrapper from "../components/SocketWrapper";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <SocketWrapperDynamic>
        <Component {...pageProps} />
      </SocketWrapperDynamic>
    </RecoilRoot>
  );
}

export default MyApp;

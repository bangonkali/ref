import React, { FunctionComponent, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import jobsState from "../atoms/job.atom";
import { io, Socket } from "socket.io-client";
import { IJob } from "../orm/models/Job";

export type SocketWrapperProps = {};

let socket: Socket | undefined = undefined;

const SocketWrapper: FunctionComponent<SocketWrapperProps> = ({ children }) => {
  const setJobsState = useSetRecoilState(jobsState);

  useEffect(() => {
    if (!process.browser) return;

    fetch("/api/socket").finally(() => {
      if (!socket) socket = io();
      if (!socket) return;

      socket.on("connect", () => {
        console.log("connect");
        socket?.emit("hello");
      });

      socket.on("hello", (data) => {
        console.log("hello", data);
      });

      socket.on("a user connected", () => {
        console.log("a user connected");
      });

      socket.on("update", (msg: IJob) => {
        console.log("update: " + msg.key);
        setJobsState((prev) => {
          return [...prev, msg];
        });
      });

      socket.on("disconnect", () => {
        console.log("disconnect");
      });
    });
  }, [setJobsState]);

  return <div>{children}</div>;
};

export default SocketWrapper;

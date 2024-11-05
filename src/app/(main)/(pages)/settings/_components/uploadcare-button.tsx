"use client";
import React, { useEffect, useRef } from "react";
import * as LR from "@uploadcare/blocks";
import { useRouter } from "next/navigation";
// import "https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.35.2/web/lr-file-uploader-regular.min.css";
import Head from "next/head";
type Props = {
  onUpload: (e: string) => any;
};
declare namespace JSX {
  interface IntrinsicElements {
    "lr-config": any; // You can replace 'any' with a more specific type if known
    "lr-file-uploader-regular": any;
    "lr-upload-ctx-provider": any;
  }
}

LR.registerBlocks(LR);

const UploadCareButton = ({ onUpload }: Props) => {
  const router = useRouter();
  const ctxProviderRef = useRef<LR.UploadCtxProvider | null>(null);

  useEffect(() => {
    const handleUpload = async (e: any) => {
      const fileUrl = e.detail.cdnUrl;
      const file = await onUpload(fileUrl);
      if (file) {
        router.refresh();
      }
    };

    const ctxProvider = ctxProviderRef.current;
    if (ctxProvider) {
      ctxProvider.addEventListener("file-upload-success", handleUpload);
    }

    return () => {
      if (ctxProvider) {
        ctxProvider.removeEventListener("file-upload-success", handleUpload);
      }
    };
  }, [onUpload, router]);

  return (
    <div>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.35.2/web/lr-file-uploader-regular.min.css"
        />
      </Head>
      <lr-config ctx-name="my-uploader" pubkey="49d7ebbd2435a880b8d8" />

      <lr-file-uploader-regular
        ctx-name="my-uploader"
        css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.35.2/web/lr-file-uploader-regular.min.css"
      />

      <lr-upload-ctx-provider ctx-name="my-uploader" ref={ctxProviderRef} />
    </div>
  );
};

export default UploadCareButton;

'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface ZoomMeetingProps {
  meetingNumber: string;
  userName: string;
  password?: string;
  role?: number; // 0 for participant, 1 for host
}

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

const ZoomMeeting = ({ meetingNumber, userName, password = '', role = 0 }: ZoomMeetingProps) => {
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Zoom
    const initializeZoom = async () => {
      const { ZoomMtg } = window;
      
      ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      // Initialize Zoom settings
      ZoomMtg.init({
        leaveUrl: window.location.origin,
        success: (success: any) => {
          console.log('Init success', success);

          // Join the meeting
          ZoomMtg.join({
            meetingNumber: meetingNumber,
            userName: userName,
            signature: '', // You'll need to generate this on your server
            sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY,
            password: password,
            success: (joinSuccess: any) => {
              console.log('Join success', joinSuccess);
            },
            error: (joinError: any) => {
              console.log('Join error', joinError);
            }
          });
        },
        error: (error: any) => {
          console.log('Init error', error);
        }
      });
    };

    if (window.ZoomMtg) {
      initializeZoom();
    }
  }, [meetingNumber, userName, password]);

  return (
    <>
      <Script
        src="https://source.zoom.us/2.18.0/lib/vendor/react.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://source.zoom.us/2.18.0/lib/vendor/react-dom.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://source.zoom.us/2.18.0/lib/vendor/redux.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://source.zoom.us/2.18.0/lib/vendor/redux-thunk.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://source.zoom.us/2.18.0/zoom-meeting-2.18.0.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('Zoom SDK loaded')}
      />
      
      <div ref={zoomRef} id="zmmtg-root" className="w-full h-[600px]" />
    </>
  );
};

export default ZoomMeeting;
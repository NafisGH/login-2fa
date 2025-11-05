import { useEffect, useState } from "react";
import styled from "styled-components";

const Wrap = styled.div`
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 1000;
  display: grid;
  gap: 6px;
  min-width: 180px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(17, 24, 39, 0.92);
  color: #e5e7eb;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  font-size: 13px;
  backdrop-filter: blur(6px);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Code = styled.span`
  font-weight: 700;
  letter-spacing: 2px;
  font-size: 16px;
  color: #a7f3d0;
`;

const Btn = styled.button`
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #374151;
  background: #111827;
  color: #e5e7eb;
  cursor: pointer;
  &:hover {
    background: #0b1220;
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Sub = styled.div`
  opacity: 0.8;
`;

type OtpPayload = { otp: string; expiresAt: number };

function enabled(): boolean {
  return (
    import.meta.env.DEV ||
    import.meta.env.VITE_SHOW_OTP === "1" ||
    new URLSearchParams(window.location.search).get("debug") === "1"
  );
}

export default function DebugOtp() {
  const [otp, setOtp] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [left, setLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!enabled()) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<OtpPayload>).detail;
      if (!detail) return;
      setOtp(detail.otp);
      setExpiresAt(detail.expiresAt);
      setCopied(false);
    };

    window.addEventListener("mock:otp", handler as EventListener);
    return () =>
      window.removeEventListener("mock:otp", handler as EventListener);
  }, []);

  useEffect(() => {
    if (!expiresAt || !enabled()) return;
    const t = setInterval(() => {
      const sec = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setLeft(sec);
    }, 250);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!enabled() || !otp) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(otp!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <Wrap role="status" aria-live="polite">
      <Row>
        <span>OTP (dev)</span>
        <Btn onClick={copy}>{copied ? "Copied" : "Copy"}</Btn>
      </Row>
      <Row>
        <Code>{otp}</Code>
        <Sub>{left}s</Sub>
      </Row>
      <Sub>Hidden in production</Sub>
    </Wrap>
  );
}

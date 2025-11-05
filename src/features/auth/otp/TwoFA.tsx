import { useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { Button } from "@/shared/ui/Button";
import { useMutation } from "@tanstack/react-query";
import { getNewOtp, verifyOtp } from "@/shared/api/auth";

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
`;

const CodeRow = styled.div<{ $error?: boolean }>`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 4px;

  ${({ $error, theme }) =>
    $error &&
    css`
      input {
        border-color: ${theme.colors.danger} !important;
        box-shadow: inset 0 0 0 1px ${theme.colors.danger} !important;
      }
    `}
`;

const CodeInput = styled.input<{ $filled?: boolean }>`
  width: 100%;
  height: 44px;
  text-align: center;
  font-size: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  outline: none;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputFocus};
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  ${({ $filled, theme }) =>
    $filled &&
    css`
      border-color: ${theme.colors.inputFocus};
    `}
`;

const Row = styled.div`
  display: grid;
  gap: 8px;
`;

const Help = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const ErrorText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
`;

const OkText = styled.div`
  font-size: 12px;
  color: #10b981; /* зелёный */
`;

type Status = "idle" | "error" | "expired" | "verified";

export default function TwoFA({ challengeId }: { challengeId: string }) {
  const [cells, setCells] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [, setMessage] = useState<string>("");

  // Локальный дедлайн 30с; после Get new обновляем из API.
  const [expiresAt, setExpiresAt] = useState<number>(() => Date.now() + 30_000);
  const [left, setLeft] = useState<number>(
    Math.ceil((expiresAt - Date.now()) / 1000)
  );

  // Таймер: НЕ запускаем, если уже verified — чтобы не ставить expired после успеха.
  useEffect(() => {
    if (status === "verified") return;
    const t = setInterval(() => {
      const sec = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setLeft(sec);
      if (sec <= 0) setStatus("expired");
    }, 250);
    return () => clearInterval(t);
  }, [expiresAt, status]);

  // автофокус первой ячейки
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const code = useMemo(() => cells.join(""), [cells]);

  const verifyMut = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      setStatus("verified");
      setMessage("valid code");
    },
    onError: (err: any) => {
      if (err?.code === "OTP_EXPIRED") {
        setStatus("expired");
        setMessage("Code expired");
        setCells(Array(6).fill(""));
        inputsRef.current[0]?.focus();
        return;
      }
      if (err?.code === "INVALID_OTP") {
        setStatus("error");
        setMessage("Invalid code");
        return;
      }
      setStatus("error");
      setMessage("Server error. Try again.");
    },
  });

  const newOtpMut = useMutation({
    mutationFn: getNewOtp,
    onSuccess: (res) => {
      setStatus("idle");
      setMessage("");
      setCells(Array(6).fill(""));
      inputsRef.current[0]?.focus();
      setExpiresAt(res.expiresAt);
    },
    onError: () => {
      setStatus("error");
      setMessage("Server error. Try again.");
    },
  });

  // === Обработчики ввода ===
  const setCell = (i: number, v: string) => {
    const next = [...cells];
    next[i] = v;
    setCells(next);
  };

  const onChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(0, 1);
    setCell(i, digit);

    if (digit && i < 5) {
      inputsRef.current[i + 1]?.focus();
    }

    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (cells[i]) {
        setCell(i, "");
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
        setCell(i - 1, "");
      }
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && i < 5) {
      inputsRef.current[i + 1]?.focus();
      e.preventDefault();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = Array(6).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setCells(next);
    const idx = Math.min(5, text.length - 1);
    inputsRef.current[idx]?.focus();
    e.preventDefault();
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  };

  // === Флаги (вынесены выше JSX) ===
  const isExpired = status === "expired";
  const isError = status === "error";
  const isVerified = status === "verified";
  const isIdle = status === "idle";

  const canContinue = code.length === 6 && isIdle;
  const disableContinue = !canContinue || verifyMut.isPending || isVerified;
  const isAnyLoading = verifyMut.isPending || newOtpMut.isPending;

  const handleContinue = () => {
    if (!canContinue || isAnyLoading) return;
    verifyMut.mutate({ challengeId, code });
  };

  const handleGetNew = () => {
    if (isAnyLoading) return;
    newOtpMut.mutate({ challengeId });
  };

  return (
    <Wrap>
      <div>
        <Title>Two-Factor Authentication</Title>
        <Subtitle>
          Enter the 6-digit code from the Google Authenticator app
        </Subtitle>
      </div>

      <Row>
        <CodeRow $error={isError}>
          {cells.map((val, i) => (
            <CodeInput
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Digit ${i + 1}`}
              maxLength={1}
              $filled={!!val}
              value={val}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
            />
          ))}
        </CodeRow>

        {/* сообщения под полем */}
        {isError && <ErrorText>invalid code</ErrorText>}
        {isExpired && <ErrorText>Code expired</ErrorText>}
        {isVerified && <OkText>valid code</OkText>}
        {!isExpired && !isVerified && <Help>Time left: {left}s</Help>}
      </Row>

      {/* Кнопки управления */}
      <Row>
        {isExpired ? (
          <Button
            type="button"
            onClick={handleGetNew}
            loading={newOtpMut.isPending}
          >
            Get new
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleContinue}
            disabled={disableContinue}
            loading={verifyMut.isPending}
          >
            Continue
          </Button>
        )}
      </Row>
    </Wrap>
  );
}

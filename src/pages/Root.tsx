import styled from "styled-components";
import Card from "@/shared/ui/Card";
import { useState } from "react";
import SignIn from "@/features/auth/signin/SignIn";
import TwoFA from "@/features/auth/otp/TwoFA";
import DebugOtp from "@/app/debug/DebugOtp";

const Center = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const Company = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;

  .dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
  }
  .brand {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text};
  }
`;

type Stage = "signin" | "2fa";

export default function Root() {
  const [stage, setStage] = useState<Stage>("signin");
  const [challengeId, setChallengeId] = useState<string | null>(null);

  return (
    <Center>
      <Card>
        <Company>
          <div className="dot" aria-hidden />
          <div className="brand">Company</div>
        </Company>

        {stage === "signin" && (
          <SignIn
            onSuccess={(id) => {
              setChallengeId(id);
              setStage("2fa");
            }}
          />
        )}

        {stage === "2fa" && challengeId && <TwoFA challengeId={challengeId} />}
        <DebugOtp />
      </Card>
    </Center>
  );
}

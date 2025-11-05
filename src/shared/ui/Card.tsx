import styled from "styled-components";
import { type PropsWithChildren } from "react";

const Wrap = styled.div`
  width: 440px;
  min-height: 372px; /* базовая высота по макету */
  height: auto; /* дальше растём по контенту */
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.card};
  background: #fff;
  padding: 24px;

  display: grid;
  gap: 16px;

  max-height: 80vh;
  overflow: auto;
`;

export default function Card({ children }: PropsWithChildren) {
  return (
    <Wrap role="region" aria-label="Auth Card">
      {children}
    </Wrap>
  );
}

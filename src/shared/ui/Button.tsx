import styled, { css } from "styled-components";
import { ButtonHTMLAttributes } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> & {
  variant?: "primary" | "ghost";
  loading?: boolean;
};

const Btn = styled.button<{
  $variant?: "primary" | "ghost";
  $loading?: boolean;
}>`
  height: 40px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid transparent;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  cursor: pointer;
  transition: opacity 0.15s, transform 0.05s;
  display: inline-grid;
  place-items: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  ${({ $variant, theme }) =>
    $variant === "ghost" &&
    css`
      background: transparent;
      border-color: ${theme.colors.border};
      color: ${theme.colors.text};
    `}
`;

export function Button({
  variant = "primary",
  loading,
  children,
  ...rest
}: Props) {
  return (
    <Btn
      $variant={variant}
      $loading={loading}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? "Loading…" : children}
    </Btn>
  );
}

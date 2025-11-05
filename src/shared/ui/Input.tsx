import styled, { css } from "styled-components";
import { forwardRef, InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "css"> & {
  invalid?: boolean;
};

const StyledInput = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 0 12px;
  outline: none;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputFocus};
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  ${({ $invalid, theme }) =>
    $invalid &&
    css`
      border-color: ${theme.colors.danger};
      box-shadow: inset 0 0 0 1px ${theme.colors.danger};
      &:focus {
        border-color: ${theme.colors.danger};
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
      }
    `}
`;

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ invalid, ...rest }, ref) => {
    return <StyledInput ref={ref} $invalid={invalid} {...rest} />;
  }
);
Input.displayName = "Input";

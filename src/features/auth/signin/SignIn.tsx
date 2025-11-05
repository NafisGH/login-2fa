import styled from "styled-components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/shared/api/auth";

const Wrap = styled.form`
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

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
`;

const schema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SignIn({
  onSuccess,
}: {
  onSuccess: (challengeId: string) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => onSuccess(data.challengeId),
    onError: (err: any) => {
      // маппинг ошибок API
      if (err?.code === "VALIDATION_ERROR" && err.details) {
        if (err.details.email)
          setError("email", { message: err.details.email });
        if (err.details.password)
          setError("password", { message: err.details.password });
        return;
      }
      if (err?.code === "INVALID_CREDENTIALS") {
        setError("email", { message: "Wrong email or password" });
        setError("password", { message: " " });
        return;
      }
      if (err?.code === "RATE_LIMIT") {
        setError("email", { message: "Too many attempts. Try again later." });
        return;
      }
      setError("email", { message: "Server error. Please try again." });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({ email: values.email, password: values.password });
  };

  return (
    <Wrap onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Title>Sign in to your account to continue</Title>
        <Subtitle>Use demo@dev.io / demo123 for success</Subtitle>
      </div>

      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
      </Field>

      <Field>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
      </Field>

      <Button
        type="submit"
        loading={mutation.isPending}
        disabled={!isValid || mutation.isPending}
      >
        Log in
      </Button>
    </Wrap>
  );
}

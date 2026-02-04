import { z } from "zod";

export const validationSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です。１文字以上入力して下さい。" }),
  email: z.string().email({ message: "メールアドレスの形式が正しくありません。" }),
  company: z.string().optional().or(z.literal("")),
  message: z.string().min(1, { message: "メッセージは必須です。" }),
});

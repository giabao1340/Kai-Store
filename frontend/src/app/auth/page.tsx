import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/components/features/auth/login-form";
import RegisterForm from "@/components/features/auth/register-fom";

export default function AuthPage() {
  return (
    <div className="w-full max-w-md px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">KAI STORE</h1>
        <p className="text-muted-foreground mt-1">Premium Sneakers</p>
      </div>

      <Card>
        <Tabs defaultValue="login">
          <CardHeader>
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Đăng nhập
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Đăng ký
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* Login Tab */}
            <TabsContent value="login">
              <CardTitle className="text-xl mb-1">Chào mừng trở lại</CardTitle>
              <CardDescription className="mb-6">
                Đăng nhập để tiếp tục mua sắm
              </CardDescription>
              <LoginForm />
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <CardTitle className="text-xl mb-1">Tạo tài khoản</CardTitle>
              <CardDescription className="mb-6">
                Đăng ký để bắt đầu mua sắm tại Kai Store
              </CardDescription>
              <RegisterForm />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

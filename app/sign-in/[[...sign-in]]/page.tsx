'use client'
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <SignIn.Root>
        <Clerk.Loading>
          {(isGlobalLoading) => (
            <>
              <SignIn.Step name="start">
                <Card className="w-full max-w-md">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                      Sign in to continue to Junie
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <Clerk.Connection name="google" asChild>
                        <Button variant="outline" disabled={isGlobalLoading}>
                          <Icons.google className="mr-2 h-4 w-4" />
                          Google
                        </Button>
                      </Clerk.Connection>
                      <Clerk.Connection name="linkedin_oidc" asChild>
                        <Button variant="outline" disabled={isGlobalLoading}>
                          <Icons.linkedin className="mr-2 h-4 w-4" />
                          LinkedIn
                        </Button>
                      </Clerk.Connection>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Email Field */}
                    <Clerk.Field name="identifier" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Email address</Label>
                      </Clerk.Label>
                      <Clerk.Input type="email" required asChild>
                        <Input placeholder="you@example.com" />
                      </Clerk.Input>
                      <Clerk.FieldError className="text-sm text-red-600" />
                    </Clerk.Field>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <SignIn.Action submit asChild>
                      <Button className="w-full" disabled={isGlobalLoading}>
                        Continue
                      </Button>
                    </SignIn.Action>
                    <p className="text-sm text-center text-gray-600">
                      Don't have an account?{' '}
                      <Link href="/sign-up" className="text-blue-600 hover:underline font-medium">
                        Sign up
                      </Link>
                    </p>
                  </CardFooter>
                </Card>
              </SignIn.Step>

              <SignIn.Step name="verifications">
                <SignIn.Strategy name="password">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">Enter your password</CardTitle>
                      <CardDescription>
                        Welcome back <SignIn.SafeIdentifier />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Clerk.Field name="password" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label>Password</Label>
                        </Clerk.Label>
                        <Clerk.Input type="password" asChild>
                          <Input placeholder="••••••••" />
                        </Clerk.Input>
                        <Clerk.FieldError className="text-sm text-red-600" />
                      </Clerk.Field>
                    </CardContent>
                    <CardFooter>
                      <SignIn.Action submit asChild>
                        <Button className="w-full" disabled={isGlobalLoading}>
                          Sign in
                        </Button>
                      </SignIn.Action>
                    </CardFooter>
                  </Card>
                </SignIn.Strategy>

                <SignIn.Strategy name="email_code">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                      <CardDescription>
                        Enter the verification code we sent you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Clerk.Field name="code" className="space-y-2">
                        <Clerk.Label className="sr-only">Verification code</Clerk.Label>
                        <div className="flex justify-center">
                          <Clerk.Input
                            type="otp"
                            className="flex justify-center gap-2"
                            autoSubmit
                            render={({ value, status }) => (
                              <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-xl font-semibold">
                                {value}
                              </div>
                            )}
                          />
                        </div>
                        <Clerk.FieldError className="text-sm text-red-600 text-center" />
                      </Clerk.Field>
                    </CardContent>
                  </Card>
                </SignIn.Strategy>
              </SignIn.Step>
            </>
          )}
        </Clerk.Loading>
      </SignIn.Root>
    </div>
  )
}

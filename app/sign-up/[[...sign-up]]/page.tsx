'use client'
import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <SignUp.Root>
        <Clerk.Loading>
          {(isGlobalLoading) => (
            <>
              <SignUp.Step name="start">
                <Card className="w-full max-w-md">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome to Junie</CardTitle>
                    <CardDescription className="text-center">
                      Your AI career coach to make more money doing work you love
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Clerk.Connection name="google" asChild>
                        <Button variant="outline" disabled={isGlobalLoading}>
                          <Clerk.Loading scope="provider:google">
                            {(isLoading) =>
                              isLoading ? (
                                <Icons.spinner className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Icons.google className="mr-2 h-4 w-4" />
                                  Google
                                </>
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </Clerk.Connection>
                      <Clerk.Connection name="linkedin_oidc" asChild>
                        <Button variant="outline" disabled={isGlobalLoading}>
                          <Clerk.Loading scope="provider:linkedin_oidc">
                            {(isLoading) =>
                              isLoading ? (
                                <Icons.spinner className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Icons.linkedin className="mr-2 h-4 w-4" />
                                  LinkedIn
                                </>
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </Clerk.Connection>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Clerk.Field name="emailAddress" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Email address</Label>
                      </Clerk.Label>
                      <Clerk.Input type="email" required asChild>
                        <Input placeholder="you@example.com" />
                      </Clerk.Input>
                      <Clerk.FieldError className="text-sm text-red-600" />
                    </Clerk.Field>

                    <Clerk.Field name="password" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Password</Label>
                      </Clerk.Label>
                      <Clerk.Input type="password" required asChild>
                        <Input placeholder="••••••••" />
                      </Clerk.Input>
                      <Clerk.FieldError className="text-sm text-red-600" />
                    </Clerk.Field>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <SignUp.Action submit asChild>
                      <Button className="w-full" disabled={isGlobalLoading}>
                        {isGlobalLoading ? 'Loading...' : 'Create Account'}
                      </Button>
                    </SignUp.Action>
                    <p className="text-sm text-center text-gray-600">
                      Already have an account?{' '}
                      <Link href="/sign-in" className="text-blue-600 hover:underline font-medium">
                        Sign in
                      </Link>
                    </p>
                  </CardFooter>
                </Card>
              </SignUp.Step>

              <SignUp.Step name="continue">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Complete your profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Clerk.Field name="username" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Username</Label>
                      </Clerk.Label>
                      <Clerk.Input type="text" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="text-sm text-red-600" />
                    </Clerk.Field>
                  </CardContent>
                  <CardFooter>
                    <SignUp.Action submit asChild>
                      <Button className="w-full" disabled={isGlobalLoading}>
                        Continue
                      </Button>
                    </SignUp.Action>
                  </CardFooter>
                </Card>
              </SignUp.Step>

              <SignUp.Step name="verifications">
                <SignUp.Strategy name="email_code">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                      <CardDescription>
                        We sent a code to your email address
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      <SignUp.Action
                        resend
                        asChild
                        fallback={({ resendableAfter }) => (
                          <p className="text-center text-sm text-gray-500">
                            Resend code in {resendableAfter}s
                          </p>
                        )}
                      >
                        <Button variant="link" type="button" className="w-full">
                          Didn't receive a code? Resend
                        </Button>
                      </SignUp.Action>
                    </CardContent>
                  </Card>
                </SignUp.Strategy>
              </SignUp.Step>
            </>
          )}
        </Clerk.Loading>
      </SignUp.Root>
    </div>
  )
}

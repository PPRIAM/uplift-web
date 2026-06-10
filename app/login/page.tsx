import { redirect } from 'next/navigation';

/**
 * /login is an alias that redirects to the existing /auth/login page.
 * Preserves the ?redirect= query param for post-login navigation.
 */
export default async function LoginRedirectPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const searchParams = await props.searchParams;
  const redirectTo = searchParams?.redirect;
  const target = redirectTo
    ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/auth/login';

  redirect(target);
}

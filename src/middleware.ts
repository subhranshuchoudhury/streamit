import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

// Initialize PocketBase client
const pb = new PocketBase(process.env.POCKETBASE_URL);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const __DEV__ = process.env.NODE_ENV === 'development';

    if (__DEV__) {
        console.log("PATH NAME", pathname)
    }

    // Get token from cookies
    const token = request.cookies.get('pb_auth')?.value;


    // if (!token && pathname === "/auth/login") {
    //     return NextResponse.next();
    // }

    // if (!token && pathname !== "/auth/login") {
    //     const response = NextResponse.redirect(new URL('/auth/login', request.url));
    //     return response;
    // }


    if (token) {
        try {
            pb.authStore.save(token);

            if (pb.authStore.isValid) {


                if (pathname === "/auth/login") {
                    const response = NextResponse.redirect(new URL('/', request.url));
                    return response;
                }

                const response = NextResponse.next();
                return response;
            } else {
                throw new Error('Invalid token');
            }
        } catch (error) {

            console.log("ERROR", error)
            const response = NextResponse.redirect(new URL('/auth/login', request.url));
            response.cookies.delete('pb_auth');
            return response;
        }
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|images|assets|vendor|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
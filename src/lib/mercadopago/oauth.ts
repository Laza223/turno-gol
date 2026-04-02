import { prisma } from "@/lib/prisma";

const MP_CLIENT_ID = process.env.MP_CLIENT_ID || "";
const MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET || "";
const MP_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/mercadopago`
  : "http://localhost:3000/dashboard/settings/mercadopago";

export class MercadoPagoOAuth {
  
  static getAuthUrl() {
    return `https://auth.mercadopago.com/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${MP_REDIRECT_URI}`;
  }

  static async exchangeCodeForTokens(code: string, complexId: string) {
    const body = new URLSearchParams({
      client_secret: MP_CLIENT_SECRET,
      client_id: MP_CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: MP_REDIRECT_URI,
    });

    const res = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
       throw new Error("Fallo la conexión con MercadoPago (Credenciales o Code inválido).");
    }

    const data = await res.json();
    
    // Save tokens heavily
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    await prisma.complex.update({
       where: { id: complexId },
       data: {
          mpConnected: true,
          mpAccessToken: data.access_token,
          mpRefreshToken: data.refresh_token,
          mpTokenExpiresAt: expiresAt,
       }
    });

    return true;
  }

  static async refreshAccessToken(complex: any) {
     if (!complex.mpRefreshToken || !complex.mpConnected) return;

     // Calculate days left
     if (complex.mpTokenExpiresAt) {
        const daysLeft = (complex.mpTokenExpiresAt.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        if (daysLeft > 7) {
           return; // Safe bounds
        }
     }

     const body = new URLSearchParams({
        client_secret: MP_CLIENT_SECRET,
        client_id: MP_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: complex.mpRefreshToken
     });

     const res = await fetch("https://api.mercadopago.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
     });

     if (!res.ok) {
        // Disconnect gracefully if refresh token is dead
        await prisma.complex.update({
           where: { id: complex.id },
           data: {
              mpConnected: false,
              mpAccessToken: null,
              mpRefreshToken: null,
              mpTokenExpiresAt: null
           }
        });
        throw new Error("No se pudo refrescar los tokens de conexión, vuelve a linkear la cuenta.");
     }

     const data = await res.json();
     const expiresAt = new Date();
     expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

     await prisma.complex.update({
       where: { id: complex.id },
       data: {
          mpConnected: true,
          mpAccessToken: data.access_token,
          mpRefreshToken: data.refresh_token,
          mpTokenExpiresAt: expiresAt,
       }
    });
  }

  static async disconnectMercadoPago(complexId: string) {
     await prisma.complex.update({
         where: { id: complexId },
         data: {
            mpConnected: false,
            mpAccessToken: null,
            mpRefreshToken: null,
            mpTokenExpiresAt: null
         }
      });
  }
}

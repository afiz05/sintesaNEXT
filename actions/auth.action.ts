"use server";

import { cookies } from "next/headers";

export const createAuthCookie = async (nama: string, nilai: string) => {
  const cookieStore = await cookies();
  cookieStore.set("userAuth", "myToken", { secure: true });
  cookieStore.set(nama, nilai, { secure: true });
};

export const deleteAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("userAuth");
  cookieStore.delete("token");
  cookieStore.delete("token");
  cookieStore.delete("nextToken");
};

export const checkAuthStatus = async (): Promise<{
  userAuth: boolean;
  token: boolean;
  accessToken: boolean;
  nextToken: boolean;
}> => {
  const cookieStore = await cookies();

  return {
    userAuth: cookieStore.has("userAuth"),
    token: cookieStore.has("token"),
    accessToken: cookieStore.has("accessToken"),
    nextToken: cookieStore.has("nextToken"),
  };
};

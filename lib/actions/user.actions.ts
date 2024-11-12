"use server";
import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import path from "path";
import { cookies } from "next/dist/server/request/cookies";
import { avatarPlaceHolderUrl } from "@/constants";
import { redirect } from "next/navigation";



const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
}

export const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);
        console.log(session);
        return session.userId;
    }
    catch (e) {
        handleError(e, "Error sending email OTP");
    }
}


const getUserByEmail = async (email: string) => {

    const { databases } = await createAdminClient()
    // console.log(databases);
    const result = await databases.listDocuments(
        appwriteConfig.database,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])]
    );

    console.log(result);
    return result.total > 0 ? result.documents[0] : null;
}

export const createAccount = async ({ fullName, email }: { fullName: string, email: string }) => {
    console.log(fullName, email);
    const existingUser = await getUserByEmail(email);
    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Error sending email OTP");

    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(appwriteConfig.database, appwriteConfig.usersCollectionId, ID.unique(), {
            fullName,
            email,
            accountId

        })
    }
    return parseStringify(existingUser);
}

export const verifySecret = async ({ accountId, password }: { accountId: string, password: string }) => {
    try {
        const { account } = await createAdminClient();
        const session = await account.createSession(accountId, password);
        (await cookies()).set('appwrite-session', session.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,

        });
        return parseStringify({ sessionId: session.$id });
    }
    catch (e) {
        handleError(e, "Error verifying OTP");
    }
}

export const getCurrentUser = async () => {
    const { databases, account } = await createSessionClient();
    const result = await account.get();
    const user = await databases.listDocuments(appwriteConfig.database, appwriteConfig.usersCollectionId, [Query.equal("accountId", result.$id)]);

    if (user.total === 0) throw new Error("User not found");
    return parseStringify(user.documents[0]);
}


export const SignOutUser = async () => {
    const { account } = await createSessionClient();
    try {

        await account.deleteSession('current'); // Deletes the current session
        (await cookies()).delete('appwrite-session');
        console.log('User logged out successfully');
    }
    catch (e) {
        handleError(e, "Error signing out user");
    } finally {
        redirect('/sign-in');
    }

}


export const signInUser = async ({ email }: { email: string }) => {
    try {
        const existingUser = await getUserByEmail(email);

        if (existingUser) {

            await sendEmailOTP({ email });

            return parseStringify({ accountId: existingUser.accountId });
        }
        return parseStringify({ accountId: null, error: "User not found" });
    }
    catch (e) {
        handleError(e, "Error signing in user");
    }
}
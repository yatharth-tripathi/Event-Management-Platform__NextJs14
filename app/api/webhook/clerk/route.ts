import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occurred -- no svix headers', {
            status: 400
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occurred', {
            status: 400
        })
    }

    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
        
        try {
            const userData = {
                clerkId: id,
                email: email_addresses[0].emailAddress,
                username: username || email_addresses[0].emailAddress.split('@')[0],
                firstName: first_name || 'Anonymous',
                lastName: last_name || 'User',
                image: image_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
            };

            const newUser = await createUser(userData);
            console.log('User created successfully:', newUser);

            if (newUser) {
                await clerkClient.users.updateUserMetadata(id, {
                    publicMetadata: {
                        userId: newUser._id
                    }
                })
            }

            return NextResponse.json({ message: 'User created successfully', user: newUser })
        } catch (error) {
            console.error('Error creating user:', error);
            return new Response('Error creating user', { status: 500 })
        }
    }

    if (eventType === 'user.updated') {
        try {
            const { id, image_url, first_name, last_name, username } = evt.data

            const user = {
                firstName: first_name || 'Anonymous',
                lastName: last_name || 'User',
                username: username || '',
                image: image_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
            }

            const updatedUser = await updateUser(id, user)
            return NextResponse.json({ message: 'User updated successfully', user: updatedUser })
        } catch (error) {
            console.error('Error updating user:', error);
            return new Response('Error updating user', { status: 500 })
        }
    }

    if (eventType === 'user.deleted') {
        try {
            const { id } = evt.data
            const deletedUser = await deleteUser(id!)
            return NextResponse.json({ message: 'User deleted successfully', user: deletedUser })
        } catch (error) {
            console.error('Error deleting user:', error);
            return new Response('Error deleting user', { status: 500 })
        }
    }

    return new Response('', { status: 200 })
}

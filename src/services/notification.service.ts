import Pusher from 'pusher-js';
import axios from 'axios';
import { environment } from '../config/environment';

let pusherClient: Pusher | null = null;

export const initializePusher = async (token: string, organizationId: string, bot: any, userId: number) => {
    if (pusherClient) {
        pusherClient.disconnect();
    }

    console.log(`Initializing Pusher notifications for organization: ${organizationId}`);

    try {
        pusherClient = new Pusher(environment.pusher.key, {
            cluster: environment.pusher.cluster,
            authorizer: (channel) => ({
                authorize: async (socketId, callback) => {
                    try {
                        const response = await axios.post(
                            `${environment.api.baseUrl}${environment.api.endpoints.pusherAuth}`,
                            {
                                socket_id: socketId,
                                channel_name: channel.name
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );

                        if (response.data) {
                            callback(null, response.data);
                        } else {
                            callback(new Error('Pusher authentication failed'), null);
                        }
                    } catch (error: any) {
                        console.error('Pusher authorization error:', error);
                        callback(error, null);
                    }
                }
            })
        });

        const channel = pusherClient.subscribe(`private-org-${organizationId}`);

        channel.bind('pusher:subscription_succeeded', () => {
            console.log('Successfully subscribed to private channel');
        });

        channel.bind('pusher:subscription_error', (error: any) => {
            console.error('Subscription error:', error);
        });

        channel.bind('deposit', (data: any) => {
            bot.telegram.sendMessage(
                userId,
                `💰 *New Deposit Received*\n\n` +
                `${data.amount} USDC deposited on ${data.network}\n` +
                `Transaction Hash: \`${data.hash}\``,
                { parse_mode: "Markdown" }
            );
        });

        return true;
    } catch (error) {
        console.error('Failed to initialize Pusher:', error);
        return false;
    }
};

export const stopNotifications = () => {
    if (pusherClient) {
        pusherClient.disconnect();
        pusherClient = null;
        console.log('Pusher notifications stopped');
    }
};
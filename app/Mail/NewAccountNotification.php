<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewAccountNotification extends Mailable  implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $email;
    public $role;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($email, $role)
    {
        $this->email = $email;
        $this->role = $role;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $roleName = ucfirst($this->role); // Capitalize the role for email
        $subject = "Welcome to PandaGrad: Your $roleName Account is Ready";

        return $this->subject($subject)
                    ->view('emails.newAccountNotification')
                    ->with([
                        'email' => $this->email,
                        'role' => $this->role,
                    ]);
    }

    /**
     * Get the message envelope.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    // public function envelope()
    // {
    //     return new Envelope(
    //         subject: 'New Account Notification',
    //     );
    // }

    // /**
    //  * Get the message content definition.
    //  *
    //  * @return \Illuminate\Mail\Mailables\Content
    //  */
    // public function content()
    // {
    //     return new Content(
    //         view: 'view.name',
    //     );
    // }

    // /**
    //  * Get the attachments for the message.
    //  *
    //  * @return array
    //  */
    // public function attachments()
    // {
    //     return [];
    // }
}

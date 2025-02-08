import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StreamChat } from 'stream-chat';
import { environment } from '../../../environments/environment';
import { catchError, Observable, of, switchMap, map, from, pipe } from 'rxjs';
import { ChannelService } from 'stream-chat-angular';
import { error } from 'console';



@Injectable({ providedIn: 'root' })
export class ChatService {
  private client: StreamChat;
  private apiUrl = 'http://localhost:3000';
  chatIsReady$!: Observable<boolean>;


  constructor(private http: HttpClient,
    private channelService: ChannelService,

  ) { }


  // Initialize Chat Client
  init(apiKey: string, currentUser: any, userToken: string)  {
    this.client = StreamChat.getInstance(apiKey);
    this.client.connectUser(
      {
        id: currentUser._id,
        name: currentUser.name,
        image: currentUser.image
      },
      userToken,
    )
  }

  sendMessage(senderId: string, receiverId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}sendMessage`, { senderId, receiverId, message });
  }

  getMessages(senderId: string, receiverId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages`, {
      params: { senderId, receiverId }
    });
  }

  // Generate User Token
  generateToken(userId: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/createStreamToken`, { _id: userId });
  }

}

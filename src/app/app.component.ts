import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChatService } from './services/chat/chat.service';
import { environment } from '../environments/environment';
import { UserService } from './services/user.service';
import { ChannelService, ChatClientService, StreamI18nService } from 'stream-chat-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {jwtDecode} from 'jwt-decode';
import { catchError, Observable, of, switchMap, map, from } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('popup', { static: false }) popup: any;
  chatIsReady$!: Observable<boolean>;


  public users: any[] = [];
  public messageText: string = "";
  public userToken: string = '';
  public messages: any[] = [];
  public showScreen = false;  // Add this line to control login visibility
  public phone: string;
  public currentUser;
  public selectedUser;




  constructor(
    private channelService: ChannelService,
    private modalService: NgbModal,
    private chatService: ChatService,
    private userService: UserService,
    private streamI18nService: StreamI18nService,
  ) { }


  ngOnInit(): void {
        // Fetch user list from API
        this.userService.getUsers().subscribe((users) => {
          console.log('Users fetched:', users);  // Check if data is being received
          this.users = Array.isArray(users) ? users : []; // Ensure it's an array
          console.log('Users fetched:', users);  // Check if data is being received
        }, (error) => {
          console.error('Error fetching users:', error);  // Log any error
        });

    this.streamI18nService.setTranslation();

  }

  ngAfterViewInit(): void {
    this.openPopup(this.popup);
  }

  openPopup(content: any): void {
    this.modalService.open(content, { backdrop: 'static', centered: true });
  }

  login(dismiss: any) {
    console.log('Login attempt with phone:', this.phone.toString());  // Log the phone number input
    const user = this.users.find((u) => u.phone === this.phone.toString());

    if (user) {
      this.currentUser = user;
      console.log(user._id);
      this.chatService.generateToken(user._id).subscribe((res) => {
        console.log('Received Token:', res.token);  // Debug: Check token content
        this.userToken = res.token;
        console.log(jwtDecode(this.userToken));
        this.showScreen = true;  // Show the chat screen after login
        dismiss();
        console.log(environment.stream.key, this.currentUser, this.userToken)
        this.chatService.init(environment.stream.key, this.currentUser, this.userToken);
        this.streamI18nService.setTranslation();

        this.chatIsReady$ = this.chatService.generateToken(user._id).pipe(
          switchMap(() => this.channelService.init({
            type: 'messaging',
            members: { $in: [user._id] },  // Initialize the messaging channel with the currentUser
          })),
          map(() => {
            this.showScreen = true;  // Show the chat screen when everything is ready
            return true;
          }),       
           catchError(() => {
            console.error('Error initializing chat');
            return of(false);  // Return false if there's an error
          })
        );
      });
    } else {
      alert('User not found!');
    }
  }

  selectUser(user: any) {
    this.selectedUser = user;

    // ✅ Fetch messages between currentUser and selectedUser
    this.chatService.getMessages(this.currentUser.id, this.selectedUser.id).subscribe((messages) => {
      this.messages = messages;
    });
  }

  sendMessage() {
    if (this.messageText.trim()) {
      this.chatService
        .sendMessage(this.currentUser.id, this.selectedUser.id, this.messageText)
        .subscribe((newMessage) => {
          this.messages.push(newMessage); // Add message to chat
          this.messageText = ''; // Clear input
        });
    }
  }


}



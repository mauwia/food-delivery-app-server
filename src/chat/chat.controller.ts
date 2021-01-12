import { Request, Response } from "express";
import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';


@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('/createChatroom')
  async createChatroom(@Req() req: Request, @Res() res: Response) {
    const response = await this.chatService.createChatroom(req.body, res);
    return response;
  }

  @Get('/getAllMessages/:chatroomId')
  getChatroomMessages(@Param('chatroomId') chatroomId: string) {
    const response = this.chatService.getChatroomMessages(chatroomId);
    return response;
  }
}

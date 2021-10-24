import { Router } from 'express';
import {
  NoticeExists,
  IsNoticeOwner,
} from '../guards/notice.guard';
import {
  YouAuthorized,
} from '../../_common/guards/user.guard';
import { NoticesRequestHandler } from '../handlers/notices.handler';



export const NoticesRouter: Router = Router({ mergeParams: true });



// GET Routes

NoticesRouter.get('/:notice_id', NoticeExists, NoticesRequestHandler.get_notice_by_id);
NoticesRouter.get('/:notice_id/stats', NoticeExists, NoticesRequestHandler.get_notice_stats);

NoticesRouter.get('/:notice_id/replies_all', NoticeExists, NoticesRequestHandler.get_notice_replies_all);
NoticesRouter.get('/:notice_id/replies', NoticeExists, NoticesRequestHandler.get_notice_replies);
NoticesRouter.get('/:notice_id/quotes/:reply_notice_id', NoticeExists, NoticesRequestHandler.get_notice_replies);

NoticesRouter.get('/:notice_id/quotes_all', NoticeExists, NoticesRequestHandler.get_notice_quotes_all);
NoticesRouter.get('/:notice_id/quotes', NoticeExists, NoticesRequestHandler.get_notice_quotes);
NoticesRouter.get('/:notice_id/quotes/:quote_notice_id', NoticeExists, NoticesRequestHandler.get_notice_quotes);

NoticesRouter.get('/:notice_id/shares_all', NoticeExists, NoticesRequestHandler.get_notice_shares_all);
NoticesRouter.get('/:notice_id/shares', NoticeExists, NoticesRequestHandler.get_notice_shares);
NoticesRouter.get('/:notice_id/shares/:share_notice_id', NoticeExists, NoticesRequestHandler.get_notice_shares);



// POST Routes

NoticesRouter.post('/owner/:you_id', YouAuthorized, NoticesRequestHandler.create_notice);



// PUT Routes



// DELETE Routes

NoticesRouter.delete('/:notice_id', YouAuthorized, NoticeExists, IsNoticeOwner, NoticesRequestHandler.delete_notice);
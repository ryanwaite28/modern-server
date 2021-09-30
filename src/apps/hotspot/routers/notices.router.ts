import { Router } from 'express';
import {
  NoticeExists,
  IsNoticeOwner,
  IsNotNoticeOwner
} from '../guards/notice.guard';
import {
  YouAuthorized,
  UserExists
} from '../../_common/guards/user.guard';
import { NoticesService } from '../services/notices.service';



export const NoticesRouter: Router = Router({ mergeParams: true });



// GET Routes

NoticesRouter.get('/:id', NoticeExists, NoticesService.get_notice_by_id);

// POST Routes

NoticesRouter.post('/owner/:you_id', YouAuthorized, NoticesService.create_notice);

// PUT Routes



// DELETE Routes

NoticesRouter.delete('/:id', YouAuthorized, NoticeExists, IsNoticeOwner, NoticesService.delete_notice);
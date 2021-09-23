
import { user_attrs_slim } from '../../_common/common.chamber';
import { IStoreImage } from '../../../cloudinary-manager';
import { PlainObject } from '../../_common/interfaces/common.interface';
import { Photos } from '../../_common/models/photo.model';
import { Videos } from '../../_common/models/video.model';
import { Audios } from '../../_common/models/audio.model';
import { Users } from '../../_common/models/user.model';
import {
  ContenderInterviewQuestions,
  ContenderInterviewAnswers,
  ContenderInterviews,
} from '../models/interviews.model';



export async function get_interview_by_id(id: number, slim: boolean = false) {
  const interview = slim 
  ? await ContenderInterviews.findByPk(id)
  : await ContenderInterviews.findOne({
      where: { id },
      include: []
    });
  return interview;
}

export async function create_interview(createObj: {

}) {
  const new_interview_model = await ContenderInterviews.create(<any> {
    
  });



  const interview = await get_interview_by_id(new_interview_model.get('id'));
  return interview!;
}

export async function update_interview(id: number, updateObj: {
  
}) {
  const updates = await ContenderInterviews.update(<any> {
    
  }, { where: { id } });
  return updates;
}

export async function delete_interview(id: number) {
  const deletes = await ContenderInterviews.destroy({ where: { id } });
  return deletes;
}


export async function get_interview_question_by_id(id: number, slim: boolean = false) {
  const interview_question = slim 
  ? await ContenderInterviewQuestions.findByPk(id)
  : await ContenderInterviewQuestions.findOne({
      where: { id },
      include: []
    });
  return interview_question;
}

export async function create_interview_question(createObj: {

}) {
  const new_interview_question_model = await ContenderInterviewQuestions.create(<any> {
    
  });



  const interview_question = await get_interview_question_by_id(new_interview_question_model.get('id'));
  return interview_question!;
}

export async function update_interview_question(id: number, updateObj: {
  
}) {
  const updates = await ContenderInterviewQuestions.update(<any> {
    
  }, { where: { id } });
  return updates;
}

export async function delete_interview_question(id: number) {
  const deletes = await ContenderInterviewQuestions.destroy({ where: { id } });
  return deletes;
}

export async function get_interview_answer_by_id(id: number, slim: boolean = false) {
  const interview_answer = slim 
  ? await ContenderInterviewAnswers.findByPk(id)
  : await ContenderInterviewAnswers.findOne({
      where: { id },
      include: []
    });
  return interview_answer;
}

export async function create_interview_answer(createObj: {

}) {
  const new_interview_answer_model = await ContenderInterviewAnswers.create(<any> {
    
  });



  const interview_answer = await get_interview_answer_by_id(new_interview_answer_model.get('id'))!;
  return interview_answer;
}

export async function update_interview_answer(id: number, updateObj: {
  
}) {
  const updates = await ContenderInterviewAnswers.update(<any> {
    
  }, { where: { id } });
  return updates;
}

export async function delete_interview_answer(id: number) {
  const deletes = await ContenderInterviewAnswers.destroy({ where: { id } });
  return deletes;
}
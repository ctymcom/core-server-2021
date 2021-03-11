import { Job } from "agenda";
import moment from "moment-timezone";
import { CollaboratorModel } from "../../graphql/modules/collaborator/collaborator.model";
import { SettingKey } from "../../configs/settingData";
import { SettingHelper } from "../../graphql/modules/setting/setting.helper";
import { Agenda } from "../agenda";
import { CustomerModel } from "../../graphql/modules/customer/customer.model";

export class CollaboratorJob {
  static jobName = "Collaborator";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job, done: any) {
    await doBusiness();
    return done();
  }
}

export default CollaboratorJob;

const doBusiness = async () => {
  // console.log('doBusiness');

  const collaborators = await CollaboratorModel.find({
    $or: [{ customerId: { $exists: false } }, { customerId: null }],
  }).limit(1000);

  // console.log('collaborators',collaborators);

  const collaboratorPhones = collaborators.map((col) => col.phone);

  const customers = await CustomerModel.find({
    phone: { $in: collaboratorPhones },
  });
  // console.log("members", memberss);

  for (const customer of customers) {
    const collaborator = collaborators.find(
      (col) => col.phone === customer.phone
    );
    if (collaborator) {
      await CollaboratorModel.findByIdAndUpdate(
        collaborator.id,
        {
          $set: {
            customerId: customer._id,
          },
        },
        { new: true }
      );
    }
  }
};

// (async () => {
//   console.log("test businessssssssssssssssssssssss");
//   await doBusiness();
// })();
export default {
  // App Header
  'app.title': 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
  'app.subtitle': 'অফিসিয়াল টেন্ডার সাবমিশন প্যাকেজ একত্রিত, যাচাই এবং প্রস্তুত করুন',
  'lang.switch': 'ভাষা',

  // Workflow Steps
  'step.tender': '১. টেন্ডারের চাহিদা লোড করুন',
  'step.upload': '২. পিডিএফ ফাইল আপলোড করুন',
  'step.match': '৩. ফাইল মেলান ও যাচাই করুন',
  'step.generate': '৪. প্যাকেজ তৈরি করুন',

  // Buttons & Actions
  'btn.loadReq': 'requirements.json লোড করুন',
  'btn.loadSample': 'নমুনা প্যাক লোড করুন',
  'btn.chooseFiles': 'পিডিএফ ফাইল বাছাই করুন',
  'upload.drop': 'পিডিএফ ফাইল এখানে টেনে আনুন, অথবা ব্রাউজ করতে ক্লিক করুন',
  'upload.hint': 'শুধুমাত্র সঠিক পিডিএফ ফাইল অনুমোদিত। সর্বোচ্চ ৩০টি ফাইল, মোট ৫০ মেগাবাইট।',
  'btn.remove': 'মুছুন',
  'btn.clear': 'মিল বাতিল করুন',
  'btn.generate': 'প্যাকেজ তৈরি করুন',
  'btn.download': 'প্যাকেজ ডাউনলোড করুন',
  'btn.preview': 'নতুন ট্যাবে দেখুন',
  'btn.autoMatch': 'স্বয়ংক্রিয়ভাবে ফাইল মেলান',
  'btn.exportCsv': 'চেকলিস্ট CSV এক্সপোর্ট করুন',
  'btn.close': 'বন্ধ করুন',

  // Tender Card
  'tender.details': 'টেন্ডারের বিবরণ',
  'tender.id': 'টেন্ডার আইডি',
  'tender.title': 'শিরোনাম',
  'tender.entity': 'ক্রয়কারী প্রতিষ্ঠান',
  'tender.bidder': 'দরদাতা',
  'tender.deadline': 'জমার শেষ তারিখ',

  // Table Columns
  'col.order': 'নং',
  'col.document': 'ডকুমেন্ট',
  'col.type': 'ধরন',
  'col.file': 'মেলানো ফাইল',
  'col.expiry': 'মেয়াদ শেষের তারিখ',
  'col.status': 'অবস্থা',
  'col.pages': 'পৃষ্ঠা',
  'col.name': 'ফাইলের নাম',
  'col.size': 'আকার',
  'col.actions': 'পদক্ষেপ',

  // Types
  'type.mandatory': 'বাধ্যতামূলক',
  'type.optional': 'ঐচ্ছিক',

  // Matching options
  'match.none': '— ফাইল নির্বাচন করুন —',
  'match.alreadyUsed': 'ইতিমধ্যে যুক্ত',
  'match.duplicateLocked': 'অনুলিপি লক করা ({name})',

  // Status Codes
  'status.MISSING': 'অনুপস্থিত',
  'status.EXPIRY_NEEDED': 'মেয়াদের তারিখ দরকার',
  'status.EXPIRED': 'মেয়াদোত্তীর্ণ',
  'status.NOT_PROVIDED': 'প্রদান করা হয়নি',
  'status.OK': 'ঠিক আছে',

  // Duplicate badge
  'file.duplicate': '{name}-এর অনুলিপি',
  'file.pagesCount': '{count}টি পৃষ্ঠা',

  // Summary Bar & Reasons
  'summary.ready': 'প্যাকেজ তৈরি করার জন্য প্রস্তুত',
  'summary.problems': 'প্যাকেজ তৈরির আগে {n}টি সমস্যা সমাধান করতে হবে',
  'summary.documentsCount': '{total}টির মধ্যে {matched}টি চাহিদা মেলানো হয়েছে',
  'reason.MISSING': '{doc}: প্রয়োজনীয় ফাইল নেই',
  'reason.EXPIRY_NEEDED': '{doc}: মেয়াদের তারিখ দিন',
  'reason.EXPIRED': '{doc}: জমার তারিখের আগেই মেয়াদ শেষ',

  // Messages & Errors
  'error.notPdf': '"{name}" পিডিএফ নয়, তাই বাদ দেওয়া হয়েছে',
  'error.damaged': '"{name}" নষ্ট বা পড়া যাচ্ছে না',
  'error.encrypted': '"{name}" পাসওয়ার্ড-সুরক্ষিত',
  'error.limitFiles': 'সর্বোচ্চ ৩০টি ফাইল অনুমোদিত',
  'error.limitSize': 'মোট আকার ৫০ মেগাবাইট বা কম হতে হবে',
  'error.badJson': 'requirements.json সঠিক নয় বা প্রয়োজনীয় ফিল্ড অনুপস্থিত',
  'error.generate': 'প্যাকেজ পিডিএফ তৈরি করা যায়নি',
  'info.generating': 'প্যাকেজ তৈরি হচ্ছে…',
  'info.done': 'প্যাকেজ প্রস্তুত ({pages} পৃষ্ঠা)',
  'empty.start': 'শুরুতে requirements.json লোড করুন',
  'empty.noFiles': 'এখনও কোনো পিডিএফ আপলোড করা হয়নি',
  'notices.dismiss': 'মুছে ফেলুন',
  'autoMatch.done': 'ফাইলের নাম অনুযায়ী {count}টি ডকুমেন্ট স্বয়ংক্রিয়ভাবে মেলানো হয়েছে'
}

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  actorRole: {
    type: String,
    default: 'SYSTEM',
  },
  action: {
    type: String,
    required: true,
  },
  entityType: {
    type: String,
    required: true, // 'DONATION', 'MATCH', 'RESCUE', 'NGO_VERIFICATION'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  previousState: {
    type: String,
    default: null,
  },
  newState: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
  metadata: {
    type: Object,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: false,
});

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

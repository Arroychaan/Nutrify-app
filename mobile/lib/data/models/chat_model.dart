/// Chat message model
class ChatMessageModel {
  final String id;
  final String conversationId;
  final String role; // 'user' or 'assistant'
  final String content;
  final DateTime createdAt;
  final Map<String, dynamic>? structuredData;

  ChatMessageModel({
    required this.id,
    required this.conversationId,
    required this.role,
    required this.content,
    required this.createdAt,
    this.structuredData,
  });

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] ?? '',
      conversationId: json['conversationId'] ?? '',
      role: json['role'] ?? 'user',
      content: json['content'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      structuredData: json['structuredData'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversationId': conversationId,
      'role': role,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'structuredData': structuredData,
    };
  }
}

/// Conversation model
class ConversationModel {
  final String id;
  final String userId;
  final String? topic;
  final bool isArchived;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ChatMessageModel> messages;

  ConversationModel({
    required this.id,
    required this.userId,
    this.topic,
    this.isArchived = false,
    required this.createdAt,
    required this.updatedAt,
    this.messages = const [],
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      topic: json['topic'],
      isArchived: json['isArchived'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
      messages: (json['messages'] as List<dynamic>?)
              ?.map((m) => ChatMessageModel.fromJson(m))
              .toList() ??
          [],
    );
  }

  /// Get last message preview
  String? get lastMessagePreview {
    if (messages.isEmpty) return null;
    final lastMsg = messages.last.content;
    return lastMsg.length > 50 ? '${lastMsg.substring(0, 50)}...' : lastMsg;
  }
}

// ===========================================
// Narrative Engine - Skorları Eğlenceli Metinlere Çevirir
// Z kuşağı dili, meme-worthy, hem flört hem arkadaş için
// ===========================================

import { BehaviorLabel } from '@/types/api';

// ==================== MESAJ HACMİ ====================
export function getVolumeNarrative(totalMessages: number): {
  title: string;
  description: string;
  emoji: string;
} {
  if (totalMessages < 500) {
    return {
      title: 'Minimalist İletişim',
      description: 'Az laf, çok ghosting. İkiniz de bu sohbete pek mesai harcamamışsınız. Asansörde göz temasından kaçınan iki komşu gibisiniz.',
      emoji: '🦗',
    };
  }
  if (totalMessages < 2000) {
    return {
      title: 'Kararında Muhabbet',
      description: 'Ne çok yapışık, ne de kopuk. Tam ortadan bir sohbet trafiği.',
      emoji: '⚖️',
    };
  }
  if (totalMessages < 10000) {
    return {
      title: 'Ciddi Sohbet Trafiği',
      description: 'Kararında muhabbet, kararında kaos. Ama yine de ekran başında epey vakit harcamışsınız.',
      emoji: '📱',
    };
  }
  return {
    title: 'Parmak İzi Silinmiş',
    description: 'Bu eforu başka bir yere verseniz startup kurup milyoner olmuştunuz. Ekrana dokunmaktan parmak iziniz silinmedi mi?',
    emoji: '🔥',
  };
}

// ==================== AKTİF SAAT ====================
export function getTimeNarrative(mostActiveHour: string, messagesByHour: Record<string, number>): {
  title: string;
  description: string;
  emoji: string;
  isNightOwl: boolean;
} {
  const hour = parseInt(mostActiveHour.split(':')[0]);
  
  // Gece mesajlarını hesapla (00:00 - 05:00)
  const nightMessages = Object.entries(messagesByHour)
    .filter(([h]) => parseInt(h) >= 0 && parseInt(h) <= 5)
    .reduce((sum, [, count]) => sum + count, 0);
  
  const totalMessages = Object.values(messagesByHour).reduce((a, b) => a + b, 0);
  const nightPercentage = totalMessages > 0 ? (nightMessages / totalMessages) * 100 : 0;

  if (hour >= 0 && hour <= 5) {
    return {
      title: 'Gece Kuşları',
      description: `Gece ${hour}'te uyumak yerine neyi çözmeye çalışıyordunuz? Tam bir overthinking seansı... Oysa biriniz "iyi geceler" yazsa herkes huzurla uyuyacaktı.`,
      emoji: '🦉',
      isNightOwl: true,
    };
  }
  if (hour >= 9 && hour <= 17) {
    return {
      title: 'Mesai Hırsızları',
      description: 'Mesai saatlerinde edilen bu kadar sohbet yüzünden ülke ekonomisi yavaşlamış olabilir. Patron bu ekran süresini görmesin.',
      emoji: '💼',
      isNightOwl: false,
    };
  }
  if (hour >= 18 && hour <= 23) {
    return {
      title: 'Akşam Sohbetçileri',
      description: 'İş/okul bitmiş, asıl mesai başlamış. Akşam saatleri tam da dedikodu ve derin konuşmalar zamanı.',
      emoji: '🌙',
      isNightOwl: nightPercentage > 15,
    };
  }
  return {
    title: 'Erken Kalkan',
    description: 'Sabahın köründe mesajlaşmak... Kahve içmeden önce bile drama mı başlıyor?',
    emoji: '☀️',
    isNightOwl: false,
  };
}

// ==================== KATILIMCI DENGE ====================
export function getBalanceNarrative(percentages: Record<string, number>): {
  title: string;
  description: string;
  dominant: string;
  emoji: string;
} {
  const entries = Object.entries(percentages);
  if (entries.length < 2) {
    return {
      title: 'Tek Kişilik Show',
      description: 'Bu sohbette sadece bir kişi varmış gibi görünüyor.',
      dominant: entries[0]?.[0] || 'Bilinmiyor',
      emoji: '🎤',
    };
  }

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const [dominant, dominantPct] = sorted[0];
  const diff = sorted[0][1] - sorted[1][1];

  if (diff < 5) {
    return {
      title: 'Mükemmel Denge',
      description: 'Neredeyse eşit mesaj trafiği. İkiniz de sohbete aynı enerjiyi vermişsiniz. Nadir görülen bir uyum!',
      dominant,
      emoji: '🤝',
    };
  }
  if (diff < 20) {
    return {
      title: 'Hafif Dengesizlik',
      description: `${dominant} biraz daha konuşkan çıktı ama çok dramatize edilecek bir fark yok.`,
      dominant,
      emoji: '📊',
    };
  }
  return {
    title: 'Tek Taraflı Sohbet',
    description: `${dominant} sohbetin %${dominantPct.toFixed(0)}'ini tek başına taşımış. Karşı taraf "hmm" ve "ok" yazarak kurtarmış galiba.`,
    dominant,
    emoji: '🎭',
  };
}

// ==================== BEHAVIOR ANALİZİ ====================
export function getBehaviorNarrative(
  label: BehaviorLabel,
  percentage: number
): {
  level: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  emoji: string;
  color: string;
} {
  const narratives = {
    gaslighting: {
      low: {
        title: 'Şeffaf İletişim',
        description: 'Manipülasyon yapamayacak kadar düz ve şeffafsınız. Gerçekleri çarpıtmak aklınızdan bile geçmemiş.',
        emoji: '✨',
      },
      medium: {
        title: 'Amatör Kıvırmalar',
        description: '"Ben öyle demedim ya" kıvırmaları dönmüş ama çok amatörce. Sadece günü kurtarmaya çalışmışsınız.',
        emoji: '🙄',
      },
      high: {
        title: 'Inception Seviyesi',
        description: 'Karşınızdakinin gerçeklik algısını bükmeye yemin etmişsiniz! "Kafanda kuruyorsun" cümlesi adeta milli marşınız. Inception filmi yanınızda belgesel kalır.',
        emoji: '🌀',
      },
    },
    love_bombing: {
      low: {
        title: 'Duvarlar Çin Seddi',
        description: 'Temkinli ve soğukkanlı. Duygularınızı ortaya dökmek yerine kasada saklamışsınız.',
        emoji: '🧊',
      },
      medium: {
        title: 'Dengeli Sevgi Gösterimi',
        description: 'Arada tatlı sözler var ama abartı yok. Sağlıklı bir doz.',
        emoji: '💕',
      },
      high: {
        title: 'Vıcık Vıcık Alert',
        description: 'Bu ne vıcıklık? Daha ilk günden devasa iltifatlar, büyük laflar... Tam bir "delulu" rüyası! Bu balon çok hızlı patlayacak.',
        emoji: '🎈',
      },
    },
    passive_aggressive: {
      low: {
        title: 'Direkt İletişim',
        description: 'İçinizde tutmamışsınız, trip atmak yerine direkt mevzuya girilmiş. Respect.',
        emoji: '💪',
      },
      medium: {
        title: 'Gizli Hesaplaşma',
        description: 'Arada atılan o 😊 emojilerinde gizli bir hesaplaşma var... "İyiyim :)" yazdığınızda hiç iyi olmadığınız belli.',
        emoji: '😊',
      },
      high: {
        title: 'Buz Devri',
        description: '"Sen bilirsin :)" ve "peki" mesajlarındaki soğuklukla küresel ısınmayı durdurabilirdiniz. Buz gibi bir kin, kusursuz bir trip sanatı.',
        emoji: '🥶',
      },
    },
    neutral: {
      low: {
        title: 'Normal Sohbet',
        description: 'Sağlıklı, dengeli bir iletişim örneği.',
        emoji: '✅',
      },
      medium: {
        title: 'Normal Sohbet',
        description: 'Çoğunlukla normal bir sohbet trafiği.',
        emoji: '✅',
      },
      high: {
        title: 'Sağlıklı İletişim',
        description: 'Tebrikler! Bu sohbet oldukça sağlıklı görünüyor. Drama yok, manipülasyon yok, düz muhabbet.',
        emoji: '💚',
      },
    },
  };

  const level: 'low' | 'medium' | 'high' = 
    percentage < 10 ? 'low' : 
    percentage < 30 ? 'medium' : 'high';

  const colors = {
    gaslighting: '#F59E0B',      // Amber
    love_bombing: '#EC4899',     // Pink
    passive_aggressive: '#3B82F6', // Blue
    neutral: '#25D366',          // Green
  };

  return {
    level,
    ...narratives[label][level],
    color: colors[label],
  };
}

// ==================== DOMINANT BEHAVIOR ====================
export function getDominantBehaviorNarrative(
  dominantBehavior: BehaviorLabel,
  percentage: number
): {
  headline: string;
  subtext: string;
  verdict: string;
} {
  const labels: Record<BehaviorLabel, string> = {
    gaslighting: 'Gaslighter',
    love_bombing: 'Love Bomber',
    passive_aggressive: 'Pasif Agresif',
    neutral: 'Normal',
  };

  if (dominantBehavior === 'neutral') {
    return {
      headline: '✅ Temiz Çıktı',
      subtext: 'Bu kişinin mesajlarında ciddi bir toksik pattern tespit edilmedi.',
      verdict: 'Güvenli',
    };
  }

  const intensity = percentage > 50 ? 'Yoğun' : percentage > 30 ? 'Belirgin' : 'Hafif';
  
  return {
    headline: `${labels[dominantBehavior]} Tespit Edildi`,
    subtext: `Mesajların %${percentage.toFixed(0)}'i bu pattern'e uyuyor.`,
    verdict: intensity,
  };
}

// ==================== OVERALL TONE ====================
export function getOverallToneNarrative(
  dominantTone: string,
  flaggedCount: number,
  totalAnalyzed: number
): {
  title: string;
  description: string;
  emoji: string;
  severity: 'safe' | 'warning' | 'danger';
} {
  const flaggedPercentage = totalAnalyzed > 0 ? (flaggedCount / totalAnalyzed) * 100 : 0;

  if (flaggedPercentage < 10) {
    return {
      title: 'Sağlıklı Sohbet',
      description: 'Bu sohbette ciddi bir toksiklik tespit edilmedi. İletişiminiz genel olarak sağlıklı görünüyor.',
      emoji: '💚',
      severity: 'safe',
    };
  }
  if (flaggedPercentage < 30) {
    return {
      title: 'Dikkatli Ol',
      description: 'Bazı mesajlarda dikkat çekici patternler var. Büyük alarm değil ama farkında olmakta fayda var.',
      emoji: '⚠️',
      severity: 'warning',
    };
  }
  return {
    title: 'Kırmızı Bayraklar',
    description: 'Bu sohbette ciddi oranda toksik pattern tespit edildi. Belki bir adım geri atıp düşünme zamanı.',
    emoji: '🚩',
    severity: 'danger',
  };
}

// ==================== FLAGGED MESSAGE INTRO ====================
export function getFlaggedMessageIntro(count: number): string {
  if (count === 0) {
    return 'Dikkat çeken bir mesaj bulamadık. Ya çok temiz bir sohbet, ya da çok iyi gizliyorsunuz 👀';
  }
  if (count <= 3) {
    return `${count} tane dikkat çeken mesaj bulduk. İşte öne çıkanlar:`;
  }
  if (count <= 10) {
    return `${count} tane flagged mesaj var. Epey malzeme çıkmış:`;
  }
  return `Tam ${count} tane flagged mesaj! Bu sohbette neler dönmüş böyle? İşte en dikkat çekicileri:`;
}

// ==================== EMOJI ANALİZİ ====================
export function getEmojiNarrative(
  totalEmojis: number,
  topEmojis: Record<string, number>,
  totalMessages: number
): {
  title: string;
  description: string;
  emojiPerMessage: number;
  topThree: string[];
} {
  const emojiPerMessage = totalMessages > 0 ? totalEmojis / totalMessages : 0;
  const topThree = Object.entries(topEmojis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emoji]) => emoji);

  if (totalEmojis === 0) {
    return {
      title: 'Emoji Yok',
      description: 'Bu sohbette hiç emoji kullanılmamış. Çok mu ciddiler yoksa 2005\'te mi kalmışlar?',
      emojiPerMessage: 0,
      topThree: [],
    };
  }

  if (emojiPerMessage < 0.1) {
    return {
      title: 'Emoji Cimrisi',
      description: 'Her 10 mesajda ancak 1 emoji düşmüş. Duygularınızı saklamayı seviyorsunuz galiba.',
      emojiPerMessage,
      topThree,
    };
  }

  if (emojiPerMessage > 1) {
    return {
      title: 'Emoji Bombardımanı',
      description: 'Her mesajda ortalama 1\'den fazla emoji! Kelimeler yetmiyor herhalde, emojilerle konuşuyorsunuz.',
      emojiPerMessage,
      topThree,
    };
  }

  return {
    title: 'Dengeli Emoji Kullanımı',
    description: 'Normal seviyede emoji kullanımı. Ne çok soğuk, ne de emoji spam.',
    emojiPerMessage,
    topThree,
  };
}
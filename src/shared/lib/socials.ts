import { FaVk, FaTelegram, FaInstagram, FaFacebookF } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { FiLink } from 'react-icons/fi'
import type { IconType } from 'react-icons'

export interface SocialMeta {
  Icon: IconType
  defaultLabel: string
}

// Соответствие типа соц. сети из CMS иконке и подписи по умолчанию.
// Используется на странице артиста и в футере (секция «Контакты»).
export const SOCIAL_META: Record<string, SocialMeta> = {
  vk: { Icon: FaVk, defaultLabel: 'ВК' },
  telegram: { Icon: FaTelegram, defaultLabel: 'Телеграм' },
  instagram: { Icon: FaInstagram, defaultLabel: 'Инстаграм' },
  x: { Icon: FaXTwitter, defaultLabel: 'X' },
  facebook: { Icon: FaFacebookF, defaultLabel: 'Facebook' },
  // Кастомная ссылка — отображается иконкой-цепочкой.
  custom: { Icon: FiLink, defaultLabel: 'Ссылка' },
}
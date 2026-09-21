import React from 'react';

/**
 * Card de métrica financeira reutilizável para o painel de Relatórios.
 *
 * @param {string}  label       - Título curto (ex: "Faturado", "Custos")
 * @param {string}  value       - Valor formatado (ex: "R$ 1.200,00")
 * @param {string}  subtitle    - Texto de apoio sob o valor
 * @param {React.ElementType} icon - Componente de ícone Lucide
 * @param {string}  [labelClass]  - Classes Tailwind para cor do label
 * @param {string}  [valueClass]  - Classes Tailwind para cor do valor
 * @param {string}  [iconClass]   - Classes Tailwind para cor do ícone
 * @param {string}  [borderClass] - Classes Tailwind para borda do card
 * @param {string}  [bgClass]     - Classes Tailwind para fundo do card
 * @param {React.ReactNode} [badge] - Conteúdo extra ao lado do label (ex: badge de %)
 * @param {string}  [subtitleClass] - Classes Tailwind para o subtítulo
 */
export default function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  labelClass = '',
  valueClass = 'text-zinc-900 dark:text-white',
  iconClass = 'text-blue-500',
  borderClass = 'border-zinc-200 dark:border-zinc-800',
  bgClass = 'bg-white dark:bg-zinc-900',
  badge = null,
  subtitleClass = 'text-zinc-500',
}) {
  return (
    <div className={`${bgClass} border ${borderClass} rounded-2xl p-4 space-y-2 shadow-xl transition-colors`}>
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
        {badge ? (
          <>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${labelClass}`}>{label}</span>
            {badge}
          </>
        ) : (
          <>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${labelClass}`}>{label}</span>
            {Icon && <Icon className={`w-4 h-4 ${iconClass}`} />}
          </>
        )}
      </div>
      <p className={`text-lg sm:text-xl font-black truncate ${valueClass}`}>
        {value}
      </p>
      <span className={`text-[10px] block truncate ${subtitleClass}`}>
        {subtitle}
      </span>
    </div>
  );
}

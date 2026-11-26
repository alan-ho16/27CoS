import { useEffect, useRef, useState } from 'react';
import {
  TUTORIAL_BOSS,
  STARTING_EQUIPMENT,
  type Equipment,
} from '../data/tutorialData';
import styles from './TutorialBattle.module.css';

interface TutorialBattleProps {
  onExit: () => void;
}

type BattleMenuMode = 'main' | 'gear';

export function TutorialBattle({ onExit }: TutorialBattleProps) {
  //tutorial player's stats (only used for reference, more complex in actual game)
  const basePlayerAttack = 3;
  const maxPlayerHp = 30;
  const maxSlots = 2; // will be set to 20 in actual game

  const [playerHp, setPlayerHp] = useState(maxPlayerHp);
  const [bossHp, setBossHp] = useState(TUTORIAL_BOSS.maxHp);
  const [equipped, setEquipped] = useState<Equipment[]>([
    STARTING_EQUIPMENT[0],
  ]);
  const [menuMode, setMenuMode] = useState<BattleMenuMode>('main');
  const [message, setMessage] = useState<string>(TUTORIAL_BOSS.introText);
  const [isBusy, setIsBusy] = useState(false);
  //helper functions to calculate the stat bonuses from all equipped items
  const totalAttackBonus = equipped.reduce(
    (sum, item) => sum + item.attackBonus,
    0,
  );
  const totalDefenseBonus = equipped.reduce(
    (sum, item) => sum + item.defenseBonus,
    0,
  );

  //Uses timed messages for Hubbob's healing.
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTimedMessage = (
    text: string,
    durationMs = 1500,
    onComplete?: () => void,
  ) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setIsBusy(true);
    setMessage(text);
    messageTimeoutRef.current = setTimeout(() => {
      messageTimeoutRef.current = null;
      setIsBusy(false);
      if (onComplete) {
        onComplete();
      } else {
        setMessage('');
      }
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // ends battle if hp reaches 0
  const isVictory = bossHp <= 0;
  const isDefeat = playerHp <= 0;
  const battleOver = isVictory || isDefeat;

  // tutorial battle only -- one "turn" consists of attack and getting attacked
  const handleFight = () => {
    if (battleOver || isBusy) return;

    const playerDamage = Math.max(1, basePlayerAttack + totalAttackBonus);
    const nextBossHp = Math.max(0, bossHp - playerDamage);
    setBossHp(nextBossHp);

    if (nextBossHp === 0) {
      setMessage(
        `You slashed ${TUTORIAL_BOSS.name} for ${playerDamage} dmg! Enemy defeated!`,
      );
      return;
    }

    const bossDamage = Math.max(1, TUTORIAL_BOSS.attack - totalDefenseBonus);
    const nextPlayerHp = Math.max(0, playerHp - bossDamage);
    setPlayerHp(nextPlayerHp);

    setMessage(
      `You hit for ${playerDamage} dmg! ${TUTORIAL_BOSS.name} hit back for ${bossDamage} dmg!`,
    );
  };
  // tutorial battle only -- equipping items can be done mid-battle
  // equipping items don't require a turn

  const handleToggleEquip = (item: Equipment) => {
    if (isBusy) return;

    const isAlreadyEquipped = equipped.some((e) => e.name === item.name);

    if (isAlreadyEquipped) {
      setEquipped((prev) => prev.filter((e) => e.name !== item.name));
      setMessage(`Unequipped ${item.name}.`);
    } else {
      if (equipped.length >= maxSlots) {
        setMessage(`Max ${maxSlots} items equipped! Unequip something first.`);
        return;
      }
      setEquipped((prev) => [...prev, item]);
      setMessage(`Equipped ${item.name}!`);
    }
  };

  // Healing takes up a "turn" -- boss heals to full as well.
  const handleHeal = () => {
    if (battleOver || isBusy) return;
    const healAmount = 10;
    const nextHp = Math.min(maxPlayerHp, playerHp + healAmount);
    setPlayerHp(nextHp);

    showTimedMessage(
      `Used Warm Towel! Restored HP to ${nextHp}/${maxPlayerHp}.`,
      1800,
      () => {
        setMessage(
          'Hubbob was not happy seeing you gain health with a measly towel. He decides to pull out a red potion from his pockets to heal back to full.',
        );
        setBossHp(TUTORIAL_BOSS.maxHp);
      },
    );
  };
  const handleRetry = () => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    setIsBusy(false);
    setPlayerHp(maxPlayerHp);
    setBossHp(TUTORIAL_BOSS.maxHp);
    setMenuMode('main');
    setMessage(TUTORIAL_BOSS.introText);
  };

  const bossHpPercent = (bossHp / TUTORIAL_BOSS.maxHp) * 100;
  const playerHpPercent = (playerHp / maxPlayerHp) * 100;

  return (
    <div className={styles.battleFrame}>
      <div className={styles.arena}>
        <div className={styles.statusBox}>
          <div className={styles.statusHeader}>
            <strong>{TUTORIAL_BOSS.name}</strong>
            <span>Lv. 1</span>
          </div>
          <div className={styles.hpBarBg}>
            <div
              className={styles.hpBarFill}
              style={{ width: `${bossHpPercent}%`, background: '#e63946' }}
            />
          </div>
          <small>
            HP: {bossHp} / {TUTORIAL_BOSS.maxHp}
          </small>
        </div>

        <div className={`${styles.statusBox} ${styles.playerStatusBox}`}>
          <div className={styles.statusHeader}>
            <strong>You</strong>
            <span>
              ATK {basePlayerAttack + totalAttackBonus} | DEF{' '}
              {totalDefenseBonus}
            </span>
          </div>
          <div className={styles.hpBarBg}>
            <div
              className={styles.hpBarFill}
              style={{ width: `${playerHpPercent}%`, background: '#2a9d8f' }}
            />
          </div>
          <small>
            HP: {playerHp} / {maxPlayerHp} • Gear: {equipped.length}/{maxSlots}
          </small>
        </div>
      </div>

      <div className={styles.bottomHud}>
        <div className={styles.dialogBox}>
          <p className={styles.dialogText}>{message}</p>
        </div>

        <div className={styles.commandPanel}>
          {battleOver ? (
            <div className={styles.grid2x2}>
              {isVictory ? (
                <button
                  type="button"
                  className={styles.pokeBtn}
                  style={{ gridColumn: 'span 2' }}
                  onClick={onExit}
                >
                  ▶ CONTINUE
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.pokeBtn}
                    onClick={handleRetry}
                  >
                    ▶ RETRY
                  </button>
                  <button
                    type="button"
                    className={styles.pokeBtn}
                    onClick={onExit}
                  >
                    ▶ MENU
                  </button>
                </>
              )}
            </div>
          ) : menuMode === 'main' ? (
            <div className={styles.grid2x2}>
              <button
                type="button"
                className={styles.pokeBtn}
                style={{ borderColor: '#e63946' }}
                disabled={isBusy}
                onClick={handleFight}
              >
                FIGHT
              </button>
              <button
                type="button"
                className={styles.pokeBtn}
                style={{ borderColor: '#457b9d' }}
                onClick={() => setMenuMode('gear')}
                disabled={isBusy}
              >
                GEAR ({equipped.length}/{maxSlots})
              </button>
              <button
                type="button"
                className={styles.pokeBtn}
                style={{ borderColor: '#2a9d8f' }}
                disabled={isBusy}
                onClick={handleHeal}
              >
                TOWEL (HEAL)
              </button>
              <button
                type="button"
                className={styles.pokeBtn}
                style={{ borderColor: '#6c757d' }}
                disabled={isBusy}
                onClick={onExit}
              >
                RUN
              </button>
            </div>
          ) : (
            <div className={styles.gearGrid}>
              {STARTING_EQUIPMENT.map((item) => {
                const isEquipped = equipped.some((e) => e.name === item.name);
                return (
                  <button
                    type="button"
                    key={item.name}
                    disabled={isBusy}
                    className={`${styles.pokeBtn} ${styles.gearBtn} ${
                      isEquipped ? styles.equippedBtn : ''
                    }`}
                    onClick={() => handleToggleEquip(item)}
                  >
                    {/* Makes item equip status and stat bonuses look pretty
                    If equipped, there is a star, removes star if not equipped/unequipped
                    Stat bonuses --- removes stat (etc. DEF) if bonus = 0, adds + or - if not 0*/}
                    {isEquipped ? '★ ' : ''}
                    {(() => {
                      const stats = [
                        item.attackBonus !== 0 &&
                          `${item.attackBonus > 0 ? `+${item.attackBonus}` : item.attackBonus}A`,
                        item.defenseBonus !== 0 &&
                          `${item.defenseBonus > 0 ? `+${item.defenseBonus}` : item.defenseBonus}D`,
                      ].filter(Boolean);

                      return (
                        <>
                          {item.name}
                          {stats.length > 0 && ` (${stats.join(' / ')})`}
                        </>
                      );
                    })()}
                  </button>
                );
              })}
              <button
                type="button"
                className={`${styles.pokeBtn} ${styles.backBtn}`}
                onClick={() => setMenuMode('main')}
              >
                ← BACK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

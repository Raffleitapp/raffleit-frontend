import styles from './Hero.module.css';

interface HeroProps {
    backgroundImage: string;
    title?: string;
    subtitle?: string;
    height?: number;
    linkText?: string;
    linkHref?: string;
}

export const Hero: React.FC<HeroProps> = ({ backgroundImage, title, subtitle, linkHref, height, linkText }) => {
    return (
        <div
            className={styles.hero}
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: `${height}vh`,
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="w-full md:w-70/100 flex flex-col items-start justify-center h-full text-white text-start p-4">
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
                {linkText && linkHref && (
                    <a
                        href={linkHref}
                        className={`${styles.heroLink} bg-btn-primary px-4 py-2 mt-4 rounded flex flex-row items-center font-semibold`}
                    >
                        {linkText}
                    </a>
                )}
                {/* {buttonText && (
                    <button className={`${styles.heroButton} bg-btn-primary`} onClick={buttonOnClick}>
                        {buttonText}
                    </button>
                )} */}
            </div>
        </div>
    );
};
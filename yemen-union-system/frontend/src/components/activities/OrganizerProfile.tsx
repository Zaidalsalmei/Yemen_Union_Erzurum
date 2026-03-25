interface OrganizerProfileProps {
    organizer: {
        id: number;
        full_name: string;
        profile_photo?: string;
        role?: string;
        phone_number?: string;
        email?: string;
    };
}

export function OrganizerProfile({ organizer }: OrganizerProfileProps) {
    const initials = organizer.full_name
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('');

    return (
        <div className="organizer-profile">
            <div className="organizer-avatar">
                {organizer.profile_photo ? (
                    <img src={organizer.profile_photo} alt={organizer.full_name} />
                ) : (
                    initials
                )}
            </div>
            <div className="organizer-info">
                <h4 className="organizer-name">{organizer.full_name}</h4>
                {organizer.role && (
                    <p className="organizer-role">{organizer.role}</p>
                )}
                <div className="organizer-contact">
                    {organizer.phone_number && (
                        <a href={`tel:${organizer.phone_number}`}>
                            📞 {organizer.phone_number}
                        </a>
                    )}
                    {organizer.email && (
                        <a href={`mailto:${organizer.email}`} style={{ marginRight: '1rem' }}>
                            ✉️ {organizer.email}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

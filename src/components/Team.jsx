import './Team.css'

const teamMembers = [
    {
        name: 'Taku Otto Angwa',
        role: 'CEO',
        title: 'Skilled Technician & Technology Expert',
        image: '/Our team/Taku Otto Angwa(CEO).jpeg',
    },
    {
        name: 'Nkemetiafie Innocencia',
        role: 'Manager',
        title: 'IT Expert & Network Engineer',
        image: '/Our team/Nkemetiafie Innocensia(Manager).jpeg',
    },
    {
        name: 'Emane Kelly Akwa',
        role: 'Deputy Manager',
        title: 'IT Expert & Trainer',
        image: '/Our team/Emane Kelly Akwa(Deputy Manager).jpeg',
    },
]

export default function Team({ showHeader = true }) {
    return (
        <section id="team" className="section team-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <span className="section-label">The Team</span>
                        <h2 className="section-title">Meet Our <span className="text-gradient-accent">Experts</span></h2>
                        <p className="section-subtitle">
                            Our team is made up of skilled technology experts and trainers dedicated to providing high quality services.
                        </p>
                    </div>
                )}

                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="team-card animate-on-scroll">
                            <div className="team-image-wrapper">
                                <img src={member.image} alt={member.name} className="team-image" />
                                <div className="team-image-overlay"></div>
                            </div>
                            <div className="team-info">
                                <span className="team-role-badge">{member.role}</span>
                                <h3 className="team-name">{member.name}</h3>
                                <p className="team-title">{member.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="team-volunteers animate-on-scroll">
                    <div className="volunteer-badge glass-card">
                        <span className="volunteer-icon">🤝</span>
                        <div>
                            <h4 className="volunteer-title">Volunteers</h4>
                            <p className="volunteer-text">Our dedicated volunteers support our mission to bridge the digital divide.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

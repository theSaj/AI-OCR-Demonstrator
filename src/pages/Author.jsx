import React from 'react';
import authorLogo from '../assets/logo.png';

const Author = () => {
    return (
        <div className="content-container">
            <h1>Meet the Author</h1>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <img
                        src={authorLogo}
                        alt="Jason Epperson"
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            display: 'block',
                            margin: '0 auto'
                        }}
                    />
                </div>
                <div style={{ flex: 2 }}>
                    <h2>Jason Epperson</h2>
                    <p><strong>Web Developer</strong></p>
                    <p>
                        Add innovation to your team! With over twenty-five yearsof experience in web development I have the
                        necessary skill set to complete complex tasks while retaining an abilty to bring a unqiue
                        and fresh dynamic to an organization.
                    </p>
                    <p>
                        My skills include the ability to describe technical concepts in simple terms in order to
                        facilitate better communication with clients & associates. I am passionate, friendly, and
                        enjoy the dynamics of working in a team environment. If your company is looking for a creative and
                        seasoned developer than search no more.
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                        <a
                            href="mailto:jason@easternstorm.net"
                            className="btn"
                            style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}
                        >
                            Contact Me
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Author;

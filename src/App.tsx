import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Mail, Phone, Lock, Shield, Link, CheckCircle, AlertCircle, User, Edit2 } from 'lucide-react';

// Types
type ContactType = 'email' | 'phone' | null;
type AuthMethod = 'password' | 'otp';
type AuthPhase = 'contact' | 'verification';
type LinkingStep = 'initiation' | 'entry' | 'verification' | 'success';

interface UserAccount {
  contact: string;
  type: ContactType;
  methods: AuthMethod[];
  verified: boolean;
}

// Helper functions moved outside component
const detectContactType = (value: string): ContactType => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
  
  if (emailRegex.test(value)) return 'email';
  if (phoneRegex.test(value)) return 'phone';
  return null;
};

const validateContact = (value: string): boolean => {
  return detectContactType(value) !== null;
};

// Combined Contact Entry and Method Selection Component - moved outside App
interface ContactAndMethodSelectionProps {
  contact: string;
  setContact: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  showMethods: boolean;
  userAccount: UserAccount | null;
  isEditing: boolean;
  onContactSubmit: (e: React.FormEvent) => void;
  onMethodSelection: (method: AuthMethod) => void;
  onEdit: () => void;
  onShowLinking: () => void;
}

const ContactAndMethodSelection: React.FC<ContactAndMethodSelectionProps> = ({
  contact,
  setContact,
  error,
  setError,
  isLoading,
  showMethods,
  userAccount,
  isEditing,
  onContactSubmit,
  onMethodSelection,
  onEdit,
  onShowLinking
}) => {
  const currentContactType = React.useMemo(() => detectContactType(contact), [contact]);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContact(e.target.value);
    setError('');
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-masai-red rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Masai</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={onContactSubmit} className="space-y-6">
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
            Email or Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="contact"
              value={contact}
              onChange={handleContactChange}
              disabled={showMethods && !isEditing}
              className={`auth-input ${
                showMethods && !isEditing ? 'bg-gray-50 text-gray-600' : ''
              }`}
              placeholder="Enter your email or phone number"
              required
              autoComplete="off"
            />
            {contact && currentContactType && !isEditing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {currentContactType === 'email' && (
                  <Mail className="w-5 h-5 text-masai-red" />
                )}
                {currentContactType === 'phone' && (
                  <Phone className="w-5 h-5 text-masai-red" />
                )}
                {showMethods && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="p-1 text-gray-400 hover:text-masai-red transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {!showMethods && (
          <button
            type="submit"
            disabled={!contact || isLoading}
            className="w-full bg-masai-red text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-masai-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </form>

      {/* Method Selection - appears after API call */}
      {showMethods && userAccount && !isEditing && (
        <div className="mt-6 space-y-4 animate-fade-in">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 font-medium">Choose how you'd like to sign in:</p>
          </div>
          
          <div className="grid gap-3">
            <button
              onClick={() => onMethodSelection('password')}
              className="p-4 border border-gray-200 rounded-lg hover:border-masai-red hover:bg-red-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-masai-red group-hover:text-white rounded-lg flex items-center justify-center transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Login via Password</h4>
                  <p className="text-sm text-gray-600">Enter your account password</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => onMethodSelection('otp')}
              className="p-4 border border-gray-200 rounded-lg hover:border-masai-red hover:bg-red-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-masai-red group-hover:text-white rounded-lg flex items-center justify-center transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Login via OTP</h4>
                  <p className="text-sm text-gray-600">Get a code sent to your {currentContactType}</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={onShowLinking}
              className="flex items-center gap-2 text-masai-red hover:text-red-700 transition-colors text-sm"
            >
              <Link className="w-4 h-4" />
              Link Account
            </button>
          </div>
        </div>
      )}

      {!showMethods && (
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-600 hover:text-masai-red transition-colors">
            Need help signing in?
          </button>
        </div>
      )}
    </div>
  );
};

// Credential Verification Component - moved outside App
interface CredentialVerificationProps {
  selectedMethod: AuthMethod | null;
  contactType: ContactType;
  credential: string;
  setCredential: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onCredentialSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onSwitchMethod: () => void;
}

// OTP Input Component
const OTPInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onError: (error: string) => void;
}> = ({ value, onChange, onError }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Initialize OTP array from value
    const otpArray = value.split('').slice(0, 6);
    while (otpArray.length < 6) {
      otpArray.push('');
    }
    setOtp(otpArray);
  }, [value]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    onChange(otpValue);
    onError('');

    // Focus next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const pasteArray = pasteData.replace(/\D/g, '').split('').slice(0, 6);
    
    const newOtp = new Array(6).fill('');
    pasteArray.forEach((digit, index) => {
      newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    onError('');

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="otp-input"
          autoComplete="off"
        />
      ))}
    </div>
  );
};
const CredentialVerification: React.FC<CredentialVerificationProps> = ({
  selectedMethod,
  contactType,
  credential,
  setCredential,
  error,
  setError,
  isLoading,
  onCredentialSubmit,
  onBack,
  onSwitchMethod
}) => {
  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredential(e.target.value);
    setError('');
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-masai-red rounded-full flex items-center justify-center mx-auto mb-4">
          {selectedMethod === 'password' ? (
            <Lock className="w-6 h-6 text-white" />
          ) : (
            <Shield className="w-6 h-6 text-white" />
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {selectedMethod === 'password' ? 'Enter Password' : 'Enter OTP'}
        </h2>
        <p className="text-gray-600">
          {selectedMethod === 'password' 
            ? 'Enter your account password to continue' 
            : `We sent a code to your ${contactType}`
          }
        </p>
      </div>

      <form onSubmit={onCredentialSubmit} className="space-y-6">
        <div>
          <label htmlFor="credential" className="block text-sm font-medium text-gray-700 mb-2">
            {selectedMethod === 'password' ? 'Password' : 'Verification Code'}
          </label>
          {selectedMethod === 'password' ? (
            <input
              type="password"
              id="credential"
              value={credential}
              onChange={handleCredentialChange}
              className="auth-input"
              placeholder="Enter your password"
              required
              autoComplete="off"
            />
          ) : (
            <OTPInput
              value={credential}
              onChange={setCredential}
              onError={setError}
            />
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!credential || isLoading}
          className="w-full bg-masai-red text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-masai-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-masai-red transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <button
          onClick={onSwitchMethod}
          className="text-sm text-masai-red hover:text-red-700 transition-colors"
        >
          Use {selectedMethod === 'password' ? 'OTP' : 'Password'} instead
        </button>
      </div>
    </div>
  );
};

function App() {
  // Main authentication state
  const [phase, setPhase] = useState<AuthPhase>('contact');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<ContactType>(null);
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [credential, setCredential] = useState('');
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMethods, setShowMethods] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Account linking state
  const [showLinking, setShowLinking] = useState(false);
  const [linkingStep, setLinkingStep] = useState<LinkingStep>('initiation');
  const [linkContact, setLinkContact] = useState('');
  const [linkContactType, setLinkContactType] = useState<ContactType>(null);
  const [linkCredential, setLinkCredential] = useState('');

  // Mock user lookup
  const lookupUser = async (contact: string): Promise<UserAccount | null> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockAccount: UserAccount = {
      contact,
      type: detectContactType(contact),
      methods: ['password', 'otp'],
      verified: true
    };
    
    setIsLoading(false);
    return mockAccount;
  };

  // Phase handlers
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContact(contact)) {
      setError('Please enter a valid email or phone number');
      return;
    }

    const currentContactType = detectContactType(contact);
    setContactType(currentContactType);
    setError('');

    const account = await lookupUser(contact);
    if (account) {
      setUserAccount(account);
      
      // If only one method available, skip selection and go directly to verification
      if (account.methods.length === 1) {
        setSelectedMethod(account.methods[0]);
        setPhase('verification');
      } else {
        // Multiple methods available, show selection
        setShowMethods(true);
      }
    }
  };

  const handleMethodSelection = (method: AuthMethod) => {
    setSelectedMethod(method);
    setPhase('verification');
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (credential.length < 3) {
      setError('Invalid credentials');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setError('');
    // Success would redirect or show success state
    alert('Authentication successful!');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMethods(false);
    setUserAccount(null);
    setError('');
  };

  const handleBack = () => {
    setPhase('contact');
    setSelectedMethod(null);
    setCredential('');
    setError('');
  };

  const handleSwitchMethod = () => {
    const otherMethod = selectedMethod === 'password' ? 'otp' : 'password';
    setSelectedMethod(otherMethod);
    setCredential('');
    setError('');
  };

  // Linking handlers
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContact(linkContact)) {
      setError('Please enter a valid email or phone number');
      return;
    }

    setLinkContactType(detectContactType(linkContact));
    setError('');
    setLinkingStep('verification');
  };

  const handleLinkVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (linkCredential.length < 4) {
      setError('Invalid verification code');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setError('');
    setLinkingStep('success');
    
    // Update user account with new contact
    if (userAccount) {
      const newContact = linkContactType === 'email' ? 'email' : 'phone';
      // In real app, this would update the backend
    }
  };

  const resetLinking = () => {
    setShowLinking(false);
    setLinkingStep('initiation');
    setLinkContact('');
    setLinkContactType(null);
    setLinkCredential('');
    setError('');
  };

  // Account Linking Components
  const LinkingInitiation = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Link className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Link Additional Contact</h3>
        <p className="text-gray-600 text-sm">
          Add another email or phone number to your account for easier access and better security.
        </p>
      </div>

      <div className="grid gap-3 mb-6">
        <button
          onClick={() => {
            setLinkingStep('entry');
            setLinkContactType('email');
          }}
          className="p-4 border border-gray-200 rounded-lg hover:border-masai-red hover:bg-red-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600 group-hover:text-masai-red" />
            <div>
              <h4 className="font-medium text-gray-900">Add Email</h4>
              <p className="text-sm text-gray-600">Link an email address</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setLinkingStep('entry');
            setLinkContactType('phone');
          }}
          className="p-4 border border-gray-200 rounded-lg hover:border-masai-red hover:bg-red-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-600 group-hover:text-masai-red" />
            <div>
              <h4 className="font-medium text-gray-900">Add Phone</h4>
              <p className="text-sm text-gray-600">Link a phone number</p>
            </div>
          </div>
        </button>
      </div>

      <button
        onClick={resetLinking}
        className="w-full py-2 text-gray-600 hover:text-masai-red transition-colors"
      >
        Cancel
      </button>
    </div>
  );

  const LinkingEntry = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-masai-red rounded-full flex items-center justify-center mx-auto mb-4">
          {linkContactType === 'email' ? (
            <Mail className="w-6 h-6 text-white" />
          ) : (
            <Phone className="w-6 h-6 text-white" />
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Add {linkContactType === 'email' ? 'Email' : 'Phone Number'}
        </h3>
        <p className="text-gray-600 text-sm">
          Enter the {linkContactType} you want to link to your account
        </p>
      </div>

      <form onSubmit={handleLinkSubmit} className="space-y-4">
        <div>
          <input
            type={linkContactType === 'email' ? 'email' : 'tel'}
            value={linkContact}
            onChange={(e) => {
              setLinkContact(e.target.value);
              setError('');
            }}
            className="auth-input"
            placeholder={`Enter ${linkContactType === 'email' ? 'email address' : 'phone number'}`}
            required
            autoComplete="off"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!linkContact}
          className="w-full bg-masai-red text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          Continue
        </button>
      </form>

      <button
        onClick={() => setLinkingStep('initiation')}
        className="w-full mt-4 py-2 text-gray-600 hover:text-masai-red transition-colors"
      >
        Back
      </button>
    </div>
  );

  const LinkingVerification = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-masai-red rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Your Contact</h3>
        <p className="text-gray-600 text-sm">
          We sent a verification code to {linkContact}
        </p>
      </div>

      <form onSubmit={handleLinkVerification} className="space-y-4">
        <div>
          <input
            type="text"
            value={linkCredential}
            onChange={(e) => {
              setLinkCredential(e.target.value);
              setError('');
            }}
            className="auth-input text-center tracking-wider"
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
            autoComplete="off"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!linkCredential || isLoading}
          className="w-full bg-masai-red text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Verify & Link'
          )}
        </button>
      </form>

      <button
        onClick={() => setLinkingStep('entry')}
        className="w-full mt-4 py-2 text-gray-600 hover:text-masai-red transition-colors"
      >
        Back
      </button>
    </div>
  );

  const LinkingSuccess = () => (
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Account Linked Successfully!</h3>
      <p className="text-gray-600 text-sm mb-6">
        Your {linkContactType} has been linked to your account. You can now use it to sign in.
      </p>

      <button
        onClick={resetLinking}
        className="w-full bg-masai-red text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
      >
        Done
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        {!showLinking && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {['contact', 'verification'].map((step, index) => {
                const stepPhases = ['contact', 'verification'];
                const currentIndex = stepPhases.indexOf(phase);
                const isActive = index === currentIndex;
                const isComplete = index < currentIndex;
                
                return (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isComplete ? 'bg-green-500' : 
                      isActive ? 'bg-masai-red' : 'bg-gray-300'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-4">
          {phase === 'contact' && (
            <ContactAndMethodSelection
              contact={contact}
              setContact={setContact}
              error={error}
              setError={setError}
              isLoading={isLoading}
              showMethods={showMethods}
              userAccount={userAccount}
              isEditing={isEditing}
              onContactSubmit={handleContactSubmit}
              onMethodSelection={handleMethodSelection}
              onEdit={handleEdit}
              onShowLinking={() => setShowLinking(true)}
            />
          )}
          {phase === 'verification' && (
            <CredentialVerification
              selectedMethod={selectedMethod}
              contactType={contactType}
              credential={credential}
              setCredential={setCredential}
              error={error}
              setError={setError}
              isLoading={isLoading}
              onCredentialSubmit={handleCredentialSubmit}
              onBack={handleBack}
              onSwitchMethod={handleSwitchMethod}
            />
          )}
        </div>

        {/* Account Linking Modal */}
        {showLinking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
              {linkingStep === 'initiation' && <LinkingInitiation />}
              {linkingStep === 'entry' && <LinkingEntry />}
              {linkingStep === 'verification' && <LinkingVerification />}
              {linkingStep === 'success' && <LinkingSuccess />}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          © 2025 Masai. Secure authentication powered by advanced SSO.
        </div>
      </div>
    </div>
  );
}

export default App;